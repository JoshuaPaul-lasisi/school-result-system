// Server-side staff sign-in. Verifies a role PIN against admin_config using the
// service_role key (never sent to the browser), then signs the role into a real
// Supabase Auth session so the database's RLS policies — not just the app's UI —
// enforce who can read/write staff-only data.
//
// Required Vercel env vars:
//   SUPABASE_SERVICE_ROLE_KEY  — Supabase dashboard → Settings → API → service_role (secret)
//
// Uses the same project URL and anon key already public in portal/index.html —
// those are not secrets, only the service_role key is.

const SUPABASE_URL = "https://gacjyhcuwizswjqauljb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2p5aGN1d2l6c3dqcWF1bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzU4NTksImV4cCI6MjA5NTMxMTg1OX0.YdoCCOR0zaVs8ZF3h0TCn6NDwamk4xu4dZLSqf8P-Vw";

import { createHash, randomBytes } from "node:crypto";

const ROLES = {
  director:   { hashCol: "pin_hash",             secretCol: "director_auth_secret",   email: "role-director@internal.debbyfieldschools.local" },
  admin:      { hashCol: "admin_pin_hash",        secretCol: "admin_auth_secret",      email: "role-admin@internal.debbyfieldschools.local" },
  operations: { hashCol: "operations_pin_hash",   secretCol: "operations_auth_secret", email: "role-operations@internal.debbyfieldschools.local" },
  owner:      { hashCol: "owner_pin_hash",        secretCol: "owner_auth_secret",      email: "role-owner@internal.debbyfieldschools.local" },
};

const LOCKOUT_MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function missingConfig() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ? null : ["SUPABASE_SERVICE_ROLE_KEY"];
}

function sha256Hex(str) {
  return createHash("sha256").update(str, "utf8").digest("hex");
}

function randomSecret() {
  return randomBytes(32).toString("hex");
}

function serviceHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function getConfigRow() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_config?id=eq.1&select=*`,
    { headers: serviceHeaders() }
  );
  if (!res.ok) throw new Error(`admin_config read failed (${res.status})`);
  const rows = await res.json();
  return rows[0] || null;
}

async function patchConfigRow(fields) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_config?id=eq.1`, {
    method: "PATCH",
    headers: { ...serviceHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`admin_config write failed (${res.status})`);
}

async function ensureAuthUser(email, password, role) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: serviceHeaders(),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { school_role: role } }),
  });
  if (res.ok) return;
  // Already exists is fine — anything else is a real failure.
  const body = await res.json().catch(() => ({}));
  const already = res.status === 422 || res.status === 400 || /already.*registered|already.*exists/i.test(body.msg || body.message || "");
  if (!already) throw new Error(`could not provision auth user (${res.status}): ${body.msg || body.message || ""}`);
}

async function passwordSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  return res.json();
}

async function verifySession(token) {
  if (!token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user?.user_metadata?.school_role || null;
}

function isLocked(lockout, role) {
  const entry = lockout?.[role];
  if (!entry?.lockedUntil) return 0;
  const remaining = new Date(entry.lockedUntil).getTime() - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
}

async function recordFailure(lockout, role) {
  const entry = lockout[role] || { count: 0 };
  entry.count = (entry.count || 0) + 1;
  if (entry.count >= LOCKOUT_MAX_ATTEMPTS) {
    entry.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
    entry.count = 0;
  }
  lockout[role] = entry;
  await patchConfigRow({ lockout });
}

async function clearFailure(lockout, role) {
  if (!lockout[role]) return;
  delete lockout[role];
  await patchConfigRow({ lockout });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const missing = missingConfig();
  if (missing) return res.status(500).json({ ok: false, error: `Server not configured. Add these to Vercel env vars: ${missing.join(", ")}` });

  const { action, role, pin, oldPin, newPin, targetRole } = req.body || {};

  try {
    if (action === "status") {
      const config = (await getConfigRow()) || {};
      const claimed = {};
      for (const r of Object.keys(ROLES)) claimed[r] = !!config[ROLES[r].hashCol];
      return res.status(200).json({ ok: true, claimed });
    }

    if (action === "signin") {
      const roleDef = ROLES[role];
      if (!roleDef) return res.status(400).json({ ok: false, error: "Unknown role" });
      if (!pin || typeof pin !== "string") return res.status(400).json({ ok: false, error: "Enter a PIN" });

      const config = (await getConfigRow()) || {};
      const lockout = config.lockout || {};
      const lockedMinutes = isLocked(lockout, role);
      if (lockedMinutes) {
        return res.status(429).json({ ok: false, error: `Too many attempts. Try again in ${lockedMinutes} minute${lockedMinutes === 1 ? "" : "s"}.` });
      }

      const hash = await sha256Hex(pin);
      const storedHash = config[roleDef.hashCol] || null;
      // Only the Director can bootstrap their own PIN on first use. Admin/Operations/Owner
      // PINs must be set by the Director first (PIN Management panel) — they can never
      // self-claim an unset PIN.
      if (storedHash === null && role !== "director") {
        return res.status(400).json({ ok: false, error: `No ${role} PIN set yet. Ask the Director to set one in Security Settings.` });
      }
      const isFirstClaim = storedHash === null;

      if (!isFirstClaim && hash !== storedHash) {
        await recordFailure(lockout, role);
        return res.status(401).json({ ok: false, error: "Incorrect PIN" });
      }

      let secret = config[roleDef.secretCol] || null;
      const patch = {};
      if (isFirstClaim) patch[roleDef.hashCol] = hash;
      if (!secret) {
        secret = randomSecret();
        patch[roleDef.secretCol] = secret;
        await ensureAuthUser(roleDef.email, secret, role);
      }
      if (Object.keys(patch).length) await patchConfigRow(patch);

      let session = await passwordSignIn(roleDef.email, secret);
      if (!session) {
        // Auth user may have been removed out-of-band — recreate with the same
        // stored secret and retry once.
        await ensureAuthUser(roleDef.email, secret, role);
        session = await passwordSignIn(roleDef.email, secret);
      }
      if (!session) return res.status(500).json({ ok: false, error: "Could not start a session. Check Supabase Auth settings." });

      await clearFailure(lockout, role);

      return res.status(200).json({
        ok: true,
        role,
        isFirstClaim,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }

    if (action === "change") {
      const roleDef = ROLES[role];
      if (!roleDef) return res.status(400).json({ ok: false, error: "Unknown role" });
      const authedRole = await verifySession((req.headers.authorization || "").replace(/^Bearer /i, ""));
      if (authedRole !== role) return res.status(401).json({ ok: false, error: "Sign in again to change your PIN" });
      if (!oldPin || !newPin) return res.status(400).json({ ok: false, error: "Missing PIN" });

      const config = (await getConfigRow()) || {};
      const oldHash = await sha256Hex(oldPin);
      if (oldHash !== (config[roleDef.hashCol] || null)) return res.status(401).json({ ok: false, error: "Current PIN is incorrect" });

      const newHash = await sha256Hex(newPin);
      await patchConfigRow({ [roleDef.hashCol]: newHash });
      return res.status(200).json({ ok: true });
    }

    if (action === "setRolePin") {
      const roleDef = ROLES[targetRole];
      if (!roleDef) return res.status(400).json({ ok: false, error: "Unknown role" });
      const authedRole = await verifySession((req.headers.authorization || "").replace(/^Bearer /i, ""));
      if (authedRole !== "director") return res.status(401).json({ ok: false, error: "Director sign-in required" });
      if (!newPin) return res.status(400).json({ ok: false, error: "Missing PIN" });

      const newHash = await sha256Hex(newPin);
      await patchConfigRow({ [roleDef.hashCol]: newHash });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || "Unexpected error" });
  }
}
