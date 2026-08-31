import { createTransport } from "nodemailer";
import nodemailer from "nodemailer";



// Helper to get or dynamically create SMTP transporter with latest process.env values
const getTransporter = () => {
  return createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, body }) => {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const senderEmail = process.env.SENDER_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass) {
      console.warn("⚠️ SMTP Credentials missing in environment variables. Email not sent.");
      return { success: false, error: "Missing SMTP credentials" };
    }

    const transporter = getTransporter();
    const response = await transporter.sendMail({
      from: senderEmail,
      to,
      subject,
      html: body,
    });

    console.log(`✉️ Email successfully dispatched to ${to}. Message ID: ${response?.messageId}`);
    return { success: true, response };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmail;