import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwarika');
    console.log('✓ Connected to MongoDB\n');

    const email = 'admin@dwarika.com';
    const password = 'admin123';

    // Find admin user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      console.log('\nCreating admin user...');
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new User({
        name: 'Admin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      await newAdmin.save();
      console.log('✓ Admin user created successfully!');
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      await mongoose.connection.close();
      return;
    }

    console.log('Admin user found:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Status: ${user.status}`);

    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`\nPassword check: ${isPasswordValid ? '✓ Valid' : '❌ Invalid'}`);

    if (user.role !== 'admin') {
      console.log('\n⚠️  User exists but is not an admin!');
      console.log('Updating role to admin...');
      user.role = 'admin';
      user.status = 'active';
      await user.save();
      console.log('✓ User role updated to admin');
    }

    if (user.status !== 'active') {
      console.log('\n⚠️  User status is not active!');
      console.log('Updating status to active...');
      user.status = 'active';
      await user.save();
      console.log('✓ User status updated to active');
    }

    if (!isPasswordValid) {
      console.log('\n⚠️  Password mismatch! Resetting password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      console.log('✓ Password reset to: admin123');
    }

    console.log('\n✓ Admin user is ready!');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();

