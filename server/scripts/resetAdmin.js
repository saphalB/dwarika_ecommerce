import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdmin = async () => {
  try {
    // Get connection string from env
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dwarika';
    
    // Fix connection string if needed
    if (mongoURI.includes('mongodb+srv://')) {
      if (mongoURI.includes('.mongodb.net/?')) {
        mongoURI = mongoURI.replace('.mongodb.net/?', '.mongodb.net/dwarika?');
      } else if (mongoURI.endsWith('.mongodb.net')) {
        mongoURI = mongoURI + '/dwarika';
      } else if (!mongoURI.match(/\.mongodb\.net\/[^\/\?]+/)) {
        mongoURI = mongoURI.replace(/(\.mongodb\.net)(\?|$)/, '$1/dwarika$2');
      }
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB\n');

    const email = 'admin@dwarika.com';
    const password = 'admin123';

    // Find or create admin user
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('Admin user found, resetting password...');
    } else {
      console.log('Admin user not found, creating new admin...');
      user = new User({
        name: 'Admin',
        email: email,
        role: 'admin',
        status: 'active'
      });
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.role = 'admin';
    user.status = 'active';
    await user.save();

    console.log('✓ Admin user ready!');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Status: ${user.status}`);
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`\nPassword verification: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.message.includes('Invalid scheme')) {
      console.error('\nYour MONGODB_URI in .env file is invalid!');
      console.error('Make sure it starts with mongodb:// or mongodb+srv://');
    }
    process.exit(1);
  }
};

resetAdmin();

