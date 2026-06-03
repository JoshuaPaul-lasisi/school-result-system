// Sends entrance exam results to a feeder school via Resend.
// Requires: RESEND_API_KEY in Vercel environment variables.
// Set up a verified sender domain at resend.com and update SENDER_EMAIL below.

const ENTRANCE_SUBJECTS = [
  "Mathematics","English","Verbal Reasoning","Quantitative Aptitude","General Reasoning"
];
const MAX_PER_SUBJECT = 100;
const MAX_TOTAL = ENTRANCE_SUBJECTS.length * MAX_PER_SUBJECT;
const SENDER_EMAIL = process.env.SENDER_EMAIL || "results@debbyfield.edu.ng";
const SENDER_NAME  = "Debbyfield Schools";

function grade(total, max) {
  const p = max > 0 ? (total / max) * 100 : 0;
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "Pass";
  return "Fail";
}
function gradeColor(g) {
  return { A:"#16a34a", B:"#16a34a", C:"#1d4ed8", Pass:"#d97706", Fail:"#dc2626" }[g] || "#111";
}

function buildEmailHtml({ school_name, contact_person, exam_session, candidates }) {
  const rows = candidates.map(c => {
    const total = ENTRANCE_SUBJECTS.reduce((s, sub) => s + (parseFloat(c.scores[sub]) || 0), 0);
    const g = grade(total, MAX_TOTAL);
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500">${c.name}</td>
        ${ENTRANCE_SUBJECTS.map(sub => `
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">
            ${c.scores[sub] != null ? c.scores[sub] : "—"}
          </td>`).join("")}
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700">
          ${total}/${MAX_TOTAL}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${gradeColor(g)}">
          ${g}
        </td>
      </tr>`;
  }).join("");

  const greeting = contact_person ? `Dear ${contact_person},` : `Dear Sir/Madam,`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;color:#111827;max-width:700px;margin:0 auto;padding:24px">
    <div style="border-top:4px solid #8B1A2F;padding-top:16px;margin-bottom:24px">
      <h2 style="margin:0;color:#8B1A2F;font-size:20px">Debbyfield Schools</h2>
      <p style="margin:4px 0 0;color:#6b7280;font-size:13px">Mushin, Lagos &nbsp;·&nbsp; Obafemi-Owode, Ogun</p>
    </div>
    <p style="margin:0 0 8px">${greeting}</p>
    <p style="margin:0 0 20px;color:#374151">
      Please find below the entrance examination results for candidates from
      <strong>${school_name}</strong> — Session: <strong>${exam_session}</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
      <thead>
        <tr style="background:#f9f9f9">
          <th style="padding:10px 12px;border-bottom:2px solid #e5e7eb;text-align:left">Name</th>
          ${ENTRANCE_SUBJECTS.map(s => `<th style="padding:10px 12px;border-bottom:2px solid #e5e7eb;text-align:center;font-size:11px">${s}</th>`).join("")}
          <th style="padding:10px 12px;border-bottom:2px solid #e5e7eb;text-align:center">Total (/${MAX_TOTAL})</th>
          <th style="padding:10px 12px;border-bottom:2px solid #e5e7eb;text-align:center">Grade</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:12px;color:#6b7280;margin:0 0 4px">
      <strong>Grading:</strong> A (80%+) &nbsp; B (70%+) &nbsp; C (60%+) &nbsp; Pass (50%+) &nbsp; Fail (&lt;50%)
    </p>
    <p style="font-size:12px;color:#6b7280;margin:0 0 24px">
      For admission enquiries, please contact us directly.
    </p>
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;font-size:12px;color:#9ca3af">
      This email was sent by the Debbyfield Operational System on behalf of Debbyfield Schools.
    </div>
  </body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { school_name, school_email, contact_person, exam_session, candidates } = req.body || {};

  if (!school_email)   return res.status(400).json({ error: "No email address provided for this school." });
  if (!candidates?.length) return res.status(400).json({ error: "No candidates to send." });
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: "RESEND_API_KEY not configured in environment variables." });

  const html = buildEmailHtml({ school_name, contact_person, exam_session, candidates });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to:      [school_email],
      subject: `Entrance Exam Results — ${school_name} — ${exam_session || ""}`,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(500).json({ error: err.message || "Resend API error" });
  }

  return res.status(200).json({ success: true });
}
