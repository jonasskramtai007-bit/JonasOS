// Minimal Resend integration — one POST, no SDK.
// Returns false (and logs) instead of throwing so callers can report
// "generated but not sent" rather than failing the whole run.

export async function sendEmail(
  subject: string,
  text: string,
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return false;
  const base = process.env.RESEND_BASE_URL ?? "https://api.resend.com";
  try {
    const response = await fetch(`${base}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "JonasOS <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
    if (!response.ok) {
      console.error("resend failed:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("resend failed:", error);
    return false;
  }
}
