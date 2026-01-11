import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node utils/printUser.js user@example.com');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.log('User not found:', email);
    } else {
      console.log('User:', {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        verificationToken: user.verificationToken,
        verificationTokenExpires: user.verificationTokenExpires,
        status: user.status
      });
    }
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
