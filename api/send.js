const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if required checkboxes are checked
  if (!req.body.accept_policy || !req.body.consent_sms) {
    return res.status(400).json({ error: 'You must accept the policy and give SMS consent.' });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Form Submission',
      text: `
First Name: ${req.body.first_name}
Last Name: ${req.body.last_name}
Email: ${req.body.email}
Phone: ${req.body.phone}
Accept Policy: Yes
Consent SMS: Yes
      `.trim()
    };

    // Add reply-to if email is provided
    if (req.body.email) {
      const replyName = `${req.body.first_name || ''} ${req.body.last_name || ''}`.trim();
      mailOptions.replyTo = {
        name: replyName || req.body.email,
        address: req.body.email
      };
    }

    // Send email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Mailer Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
