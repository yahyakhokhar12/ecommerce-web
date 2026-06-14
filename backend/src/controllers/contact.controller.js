import { sendEmail } from '../utils/sendEmail.js';
import { config } from '../config/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;
  await sendEmail({ to: config.smtp.fromEmail, subject: `Contact: ${subject}`, html });
  sendSuccess(res, 200, null, 'Message sent');
});
