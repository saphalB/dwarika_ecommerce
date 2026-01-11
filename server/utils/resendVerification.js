import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import { verificationEmail } from './emailTemplates.js';
import crypto from 'crypto';

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node utils/resendVerification.js user@example.com');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    let user = await User.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      return;
    }

    // Ensure a verification token exists
    if (!user.verificationToken || !user.verificationTokenExpires || user.verificationTokenExpires < Date.now()) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24h
      await user.save();
      console.log('Generated new verification token for user.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify#token=${user.verificationToken}`;

    // Send email
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const { subject, text, html } = verificationEmail(user.name, verifyUrl);

      try {
        const info = await transporter.sendMail({
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to: user.email,
          subject,
          text,
          html
        });
        console.log('Resent verification email:', info && (info.messageId || info.response));
        // Always log the verification URL for debugging
        console.log('Verification link (sent):', verifyUrl);
      } catch (err) {
        console.error('Failed to resend email:', err && (err.message || err));
        console.log('Verification link (on error):', verifyUrl);
      }
    } else {
      console.log('Verification link (no SMTP configured):', verifyUrl);
    }
  } catch (err) {
    console.error('Error:', err && (err.message || err));
  } finally {
    await mongoose.disconnect();
  }
}

run();
