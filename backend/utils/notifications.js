const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendEmail(to, subject, text) {
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

async function sendSMS(to, text) {
  await twilioClient.messages.create({
    body: text,
    from: process.env.TWILIO_PHONE,
    to
  });
}

module.exports = { sendEmail, sendSMS };
