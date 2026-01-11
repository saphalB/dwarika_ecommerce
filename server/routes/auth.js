import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { verificationEmail, forgotPasswordEmail } from '../utils/emailTemplates.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If the existing user hasn't verified their email or has no password set,
      // generate a fresh set-password token and send the link again.
      if (!existingUser.emailVerified || !existingUser.password) {
        existingUser.verificationToken = crypto.randomBytes(32).toString('hex');
        existingUser.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
        await existingUser.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const setPasswordUrl = `${frontendUrl}/set-password#token=${existingUser.verificationToken}`;

        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
          try {
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

            const { subject, text, html } = verificationEmail(existingUser.name, setPasswordUrl);
            const info = await transporter.sendMail({
              from: process.env.FROM_EMAIL || process.env.SMTP_USER,
              to: existingUser.email,
              subject,
              text,
              html
            });
            console.log('Resent set-password email:', info.messageId);
            console.log('Set-password link (sent):', setPasswordUrl);
          } catch (mailErr) {
            console.error('Failed to resend set-password email (nodemailer error):', mailErr.message);
            console.log('Set-password link (on error):', setPasswordUrl);
          }
        } else {
          console.log('Set-password link (no SMTP configured):', setPasswordUrl);
        }

        return res.status(200).json({ message: 'Account exists. A link to set your password has been sent to the email address if it is unverified.' });
      }

      return res.status(400).json({ message: 'User already exists' });
    }


    // Create user. Generate a set-password token for every new registration.
    const userData = {
      name,
      email,
      // password left empty until user sets it via email link
      password: undefined,
      phone,
      role: role || 'customer',
      verificationToken: crypto.randomBytes(32).toString('hex'),
      verificationTokenExpires: Date.now() + 1000 * 60 * 60 * 24 // 24 hours
    };

    const user = new User(userData);

    await user.save();

    // Send verification email (if SMTP configured) or log link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const setPasswordUrl = `${frontendUrl}/set-password#token=${user.verificationToken}`;

    // Try to send email if SMTP details provided. Use dynamic import so server still runs without nodemailer installed.
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
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


        const { subject, text, html } = verificationEmail(user.name, setPasswordUrl);

        const info = await transporter.sendMail({
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to: user.email,
          subject,
          text,
          html
        });

        console.log('Verification email sent:', info.messageId);
        // Also log the verify URL so developers can click it directly during testing
        console.log('Verification link (sent):', setPasswordUrl);
      } catch (mailErr) {
        console.error('Failed to send verification email (nodemailer error):', mailErr.message);
        console.log('Verification link (on error):', setPasswordUrl);
      }
    } else {
      console.log('Verification link (no SMTP configured):', setPasswordUrl);
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    // Do not issue an auth token at registration. Require email verification first.
    res.status(201).json({
      user: userResponse,
      message: 'Registered. Please check your email for the link to set your password and verify your account.'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set password (used when user clicks the set-password link in email)
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password required' });

    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Hash and set password
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Issue JWT and return user
    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Password set and account verified', token: jwtToken, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Require email verification for non-admin users
    if (!user.emailVerified && user.role !== 'admin') {
      return res.status(403).json({ message: 'Email not verified. Please check your email.' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Verify email
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });
    if (!user) {
      // Log invalid/expired verification attempts with a short token preview to assist debugging (do not log full token in production)
      try {
        const preview = (token || '').toString().slice(0, 12);
        console.warn('Invalid or expired verification token attempt. token_preview=', preview);
      } catch (e) {}
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // generate auth token and return user object so frontend can auto-login
    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    // Log verify success (prints user id and email). Do not expose in production logs.
    console.log('Email verification successful for user:', user._id.toString(), user.email);
    console.log('Issued verification JWT (first 20 chars):', jwtToken.substring(0, 20) + '...');

    // If the request likely came from a browser click (Accepts HTML), redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const acceptHeader = (req.headers.accept || '').toString();
    if (acceptHeader.includes('text/html')) {
      // Redirect to frontend verify route with the JWT in the hash so the frontend can pick it up and log the user in
      const redirectUrl = `${frontendUrl}/verify#token=${encodeURIComponent(jwtToken)}`;
      console.log('Redirecting browser to frontend verify URL');
      return res.redirect(302, redirectUrl);
    }

    res.json({ message: 'Email verified successfully', token: jwtToken, user: userResponse });
  } catch (err) {
    console.error('Error during email verification:', err && err.message ? err.message : err);
    res.status(500).json({ message: err.message });
  }
});

// Forgot password - request a reset link (email must be registered)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not registered' });
    }

    // Generate a set-password token (reuse verificationToken fields)
    user.verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const setPasswordUrl = `${frontendUrl}/set-password#token=${user.verificationToken}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
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

        const { subject, text, html } = forgotPasswordEmail(user.name || 'Customer', setPasswordUrl);

        const info = await transporter.sendMail({
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to: user.email,
          subject,
          text,
          html
        });
        console.log('Forgot-password email sent:', info.messageId);
        console.log('Set-password link (sent):', setPasswordUrl);
      } catch (mailErr) {
        console.error('Failed to send forgot-password email (nodemailer error):', mailErr.message);
        console.log('Set-password link (on error):', setPasswordUrl);
      }
    } else {
      console.log('Set-password link (no SMTP configured):', setPasswordUrl);
    }

    res.json({ message: 'Reset link sent to the registered email address' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

