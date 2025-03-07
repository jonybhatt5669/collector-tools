"use server";
import { EmailTemplate } from "./email-template";
import { render } from "@react-email/components";
import nodemailer from "nodemailer";
const { SMTP_SERVER_USERNAME, SMTP_SERVER_PASSWORD, SMTP_SERVER_HOST } =
  process.env;

interface SendEmailOptions {
  sendTo?: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: SMTP_SERVER_HOST,
  port: 587,
  secure: true, // or 'STARTTLS'
  auth: {
    user: SMTP_SERVER_USERNAME,
    pass: SMTP_SERVER_PASSWORD,
  },
});
export async function sendMail({ sendTo, text }: SendEmailOptions) {
  const emailHtml = await render(EmailTemplate({ validationCode: text }));

  const info = await transporter.sendMail({
    from: SMTP_SERVER_USERNAME,
    to: sendTo,

    html: emailHtml,
  });
  console.log("Message Sent", info.messageId);
  return info;
}
