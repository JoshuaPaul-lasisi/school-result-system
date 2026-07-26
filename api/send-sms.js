// Sends bulk SMS to parents via Termii.
// Requires: TERMII_API_KEY in Vercel environment variables.
// Get your key from: https://accounts.termii.com/#/

const TERMII_BASE = "https://api.ng.termii.com/api";
const SENDER_ID   = process.env.TERMII_SENDER_ID || "Debbyfield";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "TERMII_API_KEY is not set in Vercel environment variables. Add it in your Vercel project settings."
    });
  }

  // GET ?action=balance — check remaining SMS credits
  if (req.method === "GET") {
    try {
      const r = await fetch(`${TERMII_BASE}/get-balance?api_key=${encodeURIComponent(apiKey)}`);
      const data = await r.json();
      if (!r.ok) return res.status(502).json({ error: data.message || "Could not fetch balance" });
      return res.status(200).json({ balance: data.balance, currency: data.currency || "NGN" });
    } catch (e) {
      return res.status(502).json({ error: "Network error contacting Termii" });
    }
  }

  // POST — send bulk SMS
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, phones, sender_id } = req.body || {};

  if (!message?.trim())    return res.status(400).json({ error: "Message text is required." });
  if (!phones?.length)     return res.status(400).json({ error: "No phone numbers provided." });
  if (phones.length > 2000) return res.status(400).json({ error: "Too many recipients. Split into batches of 2000." });

  // Validate and deduplicate phone numbers
  const valid   = [...new Set(phones.filter(p => /^\d{10,15}$/.test(p)))];
  const invalid = phones.length - valid.length;
  if (!valid.length) return res.status(400).json({ error: "No valid phone numbers found." });

  try {
    const r = await fetch(`${TERMII_BASE}/sms/send/bulk`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        to:      valid,
        from:    sender_id || SENDER_ID,
        sms:     message.trim(),
        type:    "plain",
        channel: "generic",
      }),
    });

    const data = await r.json();

    if (!r.ok || (data.code && data.code !== "ok")) {
      return res.status(502).json({ error: data.message || "Termii returned an error. Check your API key and sender ID." });
    }

    return res.status(200).json({
      success:    true,
      sent:       valid.length,
      skipped:    invalid,
      message_id: data.message_id || null,
      balance:    data.balance     || null,
    });
  } catch (e) {
    return res.status(502).json({ error: "Network error contacting Termii: " + e.message });
  }
}
