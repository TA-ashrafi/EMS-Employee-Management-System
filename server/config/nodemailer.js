import { createTransport } from "nodemailer";
import nodemailer from "nodemailer";



// Helper to get or dynamically create SMTP transporter with latest process.env values
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;

  return createTransport({
    host,
    port,
    secure: isSecure, // false for 587, true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Prevents TLS handshake failure on cloud serverless runtimes
    },
    connectionTimeout: 10000, // 10s timeout
  });
};

const sendEmail = async ({ to, subject, body }) => {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const rawSender = process.env.SENDER_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass) {
      console.warn("⚠️ SMTP Credentials missing in environment variables (SMTP_USER / SMTP_PASS). Email skipped.");
      return { success: false, error: "Missing SMTP credentials" };
    }

    // Format sender email with Lemon Media Company display name
    const formattedSender = rawSender?.includes("<")
      ? rawSender
      : `"Lemon Media Company" <${rawSender}>`;

    const transporter = getTransporter();

    const response = await transporter.sendMail({
      from: formattedSender,
      to,
      subject,
      html: body,
    });

    console.log(`✉️ Email successfully sent to ${to}. Message ID: ${response?.messageId}`);
    return { success: true, response };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    return { success: false, error: error.message || error };
  }
};

export default sendEmail;