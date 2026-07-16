export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.EMAIL_FROM ?? "noreply@vibecodeflow.com";
    const { error } = await resend.emails.send({ from, to, subject, html });
    return !error;
  } catch {
    return false;
  }
}
