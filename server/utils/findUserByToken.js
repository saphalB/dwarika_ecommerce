import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';

async function run() {
  const token = process.argv[2];
  if (!token) {
    console.error('Usage: node utils/findUserByToken.js <token>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ verificationToken: token }).lean();
    if (!user) {
      console.log('No user found for that token.');
    } else {
      console.log('Found user:');
      console.log({ _id: user._id, email: user.email, name: user.name, emailVerified: user.emailVerified, verificationTokenExpires: user.verificationTokenExpires });
    }
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
