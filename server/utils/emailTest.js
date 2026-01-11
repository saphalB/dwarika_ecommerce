import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
  try {
    const nodemailer = await import('nodemailer');

    console.log('SMTP_HOST=', process.env.SMTP_HOST, 'SMTP_PORT=', process.env.SMTP_PORT);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified. Sending test email...');

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Dwarika SMTP test',
      text: `This is a test email from the Dwarika server. If you receive this, SMTP is working. Time: ${new Date().toISOString()}`,
    });

    console.log('Test email sent:', info && (info.messageId || info.response) );
  } catch (err) {
    console.error('SMTP test error:', err && (err.message || err));
    if (err && err.response) console.error('SMTP response:', err.response);
  }
}

runTest();
