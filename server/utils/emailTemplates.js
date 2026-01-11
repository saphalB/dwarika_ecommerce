export function verificationEmail(name, verifyUrl) {
  const subject = 'Please verify your Dwarika account email';

  const text = `Hi ${name},\n\nPlease verify your email address by visiting the following link:\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not register, please ignore this message.\n\n— Dwarika Team`;

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #f0e6d6;border-radius:8px;background:#fff;">
      <div style="text-align:center;padding-bottom:12px;">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#fbbf24);display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:28px;">D</div>
      </div>
      <h2 style="color:#b45309;text-align:center;margin:0 0 12px 0;">Set your password & verify your email</h2>
      <p style="color:#333;margin:0 0 16px 0;">Hi ${name},</p>
      <p style="color:#333;margin:0 0 20px 0;">Thanks for registering at Dwarika. To finish creating your account, set a password by clicking the button below.</p>
      <div style="text-align:center;margin:20px 0;">
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#f59e0b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Set Password</a>
      </div>
      <p style="color:#666;font-size:13px;margin:0 0 8px 0;text-align:center;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;color:#2563eb;font-size:13px;text-align:center;margin:0 0 12px 0;">${verifyUrl}</p>
      <p style="color:#777;font-size:13px;margin:0 0 8px 0;">This link expires in 24 hours.</p>
      <p style="color:#777;font-size:13px;margin:16px 0 0 0;">— The Dwarika Team</p>
    </div>
  </div>
  `;

  return { subject, text, html };
}

export function forgotPasswordEmail(name, resetUrl) {
  const subject = 'Reset your Dwarika account password';

  const text = `Hi ${name},\n\nWe received a request to reset your password. Click the link below to set a new password:\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email. The link will expire in 24 hours.\n\n— Dwarika Team`;

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #f0e6d6;border-radius:8px;background:#fff;">
      <div style="text-align:center;padding-bottom:12px;">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#f97316);display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:28px;">D</div>
      </div>
      <h2 style="color:#b91c1c;text-align:center;margin:0 0 12px 0;">Password reset request</h2>
      <p style="color:#333;margin:0 0 16px 0;">Hi ${name},</p>
      <p style="color:#333;margin:0 0 20px 0;">We received a request to reset the password for your Dwarika account. Click the button below to choose a new password.</p>
      <div style="text-align:center;margin:20px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#ef4444;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
      </div>
      <p style="color:#666;font-size:13px;margin:0 0 8px 0;text-align:center;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;color:#2563eb;font-size:13px;text-align:center;margin:0 0 12px 0;">${resetUrl}</p>
      <p style="color:#777;font-size:13px;margin:0 0 8px 0;">This link expires in 24 hours.</p>
      <p style="color:#777;font-size:13px;margin:16px 0 0 0;">— The Dwarika Team</p>
    </div>
  </div>
  `;

  return { subject, text, html };
}

export default { verificationEmail, forgotPasswordEmail };
