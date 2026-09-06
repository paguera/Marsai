import nodemailer from "nodemailer";
import Attachment from "../interfaces/services.interfaces";

// SMTP transporter configuration using the requested MAIL_* environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com", 
  port: parseInt(process.env.MAIL_PORT || "587", 10),
  secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Sends an email using Nodemailer.
 * @param to - The recipient's email address.
 * @param subject - The email subject.
 * @param textBody - The plain text body of the email.
 * @param htmlBody - The HTML body of the email.
 * @param attachments - Optional array of attachments.
 * @param fromEmail - The sender's email address. Defaults to MAIL_USER.
 * @param fromName - The sender's name.
 */
async function sendEmail({
  to,
  subject,
  textBody,
  htmlBody,
  attachments = [],
  fromEmail = process.env.MAIL_USER || "",
  fromName = "MarsAI - LYON | GVF Production",
}: {
  to?: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  attachments?: Attachment[];
  fromEmail?: string;
  fromName?: string;
}): Promise<any> {
  // If "to" is not specified, check if MAIL_TO is defined
  const recipient = to || process.env.MAIL_TO;
  if (!recipient) {
    throw new Error(
      "No recipient email specified (missing both 'to' parameter and MAIL_TO env variable)"
    );
  }

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: recipient,
    subject,
    text: textBody,
    html: htmlBody,
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      path: attachment.path,
    })),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    throw err;
  }
}

export default sendEmail;
