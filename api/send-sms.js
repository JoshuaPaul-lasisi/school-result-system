// Sends bulk SMS to parents via Twilio.
// Required Vercel env vars:
//   TWILIO_ACCOUNT_SID  — from console.twilio.com (starts with AC...)
//   TWILIO_AUTH_TOKEN   — from the same page
//   TWILIO_FROM         — your Twilio phone number in E.164 format, e.g. +12015551234

const TWILIO_BASE = "https://api.twilio.com/2010-04-01";

function twilioAuth() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  return "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
}

function missingConfig() {
  const missing = ["TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_FROM"]
    .filter(k => !process.env[k]);
  return missing.length ? missing : null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const missing = missingConfig();
  if (missing) {
    return res.status(500).json({
      error: `Twilio not configured. Add these to Vercel env vars: ${missing.join(", ")}`
    });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;

  // ── GET: check account balance ──────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const r = await fetch(`${TWILIO_BASE}/Accounts/${sid}/Balance.json`, {
        headers: { Authorization: twilioAuth() },
      });
      const d = await r.json();
      if (!r.ok) return res.status(502).json({ error: d.message || "Twilio balance check failed" });
      return res.status(200).json({ balance: parseFloat(d.balance || 0).toFixed(2), currency: d.currency || "USD" });
    } catch (e) {
      return res.status(502).json({ error: "Could not reach Twilio: " + e.message });
    }
  }

  // ── POST: send bulk SMS ─────────────────────────────────────────────────────
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, phones } = req.body || {};
  if (!message?.trim())  return res.status(400).json({ error: "Message text is required." });
  if (!phones?.length)   return res.status(400).json({ error: "No phone numbers provided." });

  const from = process.env.TWILIO_FROM;

  // Normalise to E.164 and deduplicate
  const e164 = [...new Set(
    phones
      .map(p => String(p).replace(/\D/g, ""))         // strip non-digits
      .filter(p => p.length >= 10 && p.length <= 15)
      .map(p => "+" + p)
  )];

  if (!e164.length) return res.status(400).json({ error: "No valid phone numbers." });

  const endpoint = `${TWILIO_BASE}/Accounts/${sid}/Messages.json`;
  const auth     = twilioAuth();

  // Send all messages concurrently (Twilio handles the rate limiting on their end)
  const results = await Promise.allSettled(
    e164.map(to =>
      fetch(endpoint, {
        method:  "POST",
        headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
        body:    new URLSearchParams({ From: from, To: to, Body: message.trim() }).toString(),
      }).then(r => r.json())
    )
  );

  let sent = 0, failed = 0;
  const errors = [];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      const d = r.value;
      if (d.sid && !d.error_code) {
        sent++;
      } else {
        failed++;
        if (d.message && errors.length < 3) errors.push(d.message);
      }
    } else {
      failed++;
    }
  });

  // Fetch updated balance (non-critical — ignore errors)
  let balance = null;
  try {
    const br = await fetch(`${TWILIO_BASE}/Accounts/${sid}/Balance.json`, {
      headers: { Authorization: auth },
    });
    if (br.ok) { const bd = await br.json(); balance = parseFloat(bd.balance || 0).toFixed(2); }
  } catch (_) {}

  return res.status(200).json({
    success: sent > 0,
    sent,
    failed,
    balance,
    currency: "USD",
    errors: errors.length ? errors : undefined,
  });
}
