'use strict';

const nodemailer = require('nodemailer');

/**
 * Vercel serverless function to send email via SMTP using Nodemailer.
 * Expects JSON body with: first_name, last_name, email, phone, accept_policy, consent_sms
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const firstName = String(body.first_name || '').trim();
    const lastName = String(body.last_name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const acceptPolicy = Boolean(body.accept_policy);
    const consentSms = Boolean(body.consent_sms);

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    if (!acceptPolicy || !consentSms) {
      return res.status(400).json({ ok: false, error: 'You must accept the policy and give SMS consent.' });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = process.env.TO_EMAIL; // recipient
    const fromEmail = process.env.FROM_EMAIL || smtpUser;
    const fromName = process.env.FROM_NAME || 'Website Form';

    if (!smtpHost || !smtpUser || !smtpPass || !toEmail) {
      const missing = [
        !smtpHost && 'SMTP_HOST',
        !smtpUser && 'SMTP_USER',
        !smtpPass && 'SMTP_PASS',
        !toEmail && 'TO_EMAIL',
      ].filter(Boolean);
      console.error('Email service not configured. Missing env:', missing.join(', '));
      return res.status(500).json({ ok: false, error: 'Email service not configured.' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const replyToName = `${firstName} ${lastName}`.trim();

    await transporter.sendMail({
      from: { name: fromName, address: fromEmail },
      to: toEmail,
      subject: 'New Form Submission',
      text: `First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Phone: ${phone}
Accept Policy: Yes
Consent SMS: Yes`,
      replyTo: email ? { name: replyToName || email, address: email } : undefined,
    });

    return res.status(200).json({ ok: true, message: 'Message sent successfully!' });
  } catch (err) {
    const message = err && err.message ? err.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: message });
  }
};


