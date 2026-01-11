import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dwarika';
    
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', mongoURI.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    // Ensure database name is in the connection string
    let connectionString = mongoURI;
    if (connectionString.includes('mongodb+srv://')) {
      // For Atlas, check if database name is missing
      if (connectionString.includes('.mongodb.net/?') || connectionString.match(/\.mongodb\.net$/)) {
        connectionString = connectionString.replace(/\.mongodb\.net(\?|$)/, '.mongodb.net/dwarika$1');
      } else if (!connectionString.match(/\.mongodb\.net\/[^\/\?]+/)) {
        connectionString = connectionString.replace(/(\.mongodb\.net)(\?|$)/, '$1/dwarika$2');
      }
    } else if (connectionString.includes('mongodb://') && !connectionString.match(/\/[^\/\?]+(\?|$)/)) {
      connectionString = connectionString.replace(/\/$/, '/dwarika');
    }
    
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✓ Connection successful!');
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Host: ${mongoose.connection.host}`);
    console.log(`  Port: ${mongoose.connection.port || 'N/A (Atlas)'}`);
    
    // Test a simple query
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const count = await User.countDocuments();
    console.log(`  Users collection: ${count} documents`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed!');
    console.error('  Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check MongoDB Atlas Network Access - whitelist your IP (0.0.0.0/0 for all)');
    console.error('  2. Verify connection string in .env file');
    console.error('  3. Check database user credentials');
    console.error('  4. Ensure database name is in connection string');
    process.exit(1);
  }
};

testConnection();

