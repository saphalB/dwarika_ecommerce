import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('Checking .env file...\n');

if (!fs.existsSync(envPath)) {
  console.log('✗ .env file not found!');
  console.log('Creating .env file with default values...\n');
  
  const defaultEnv = `PORT=5000
MONGODB_URI=mongodb+srv://db_user:KgNu6aK9b3HfEi48@dwarika.4cuq2sy.mongodb.net/dwarika?appName=dwarika
JWT_SECRET=dwarika-secret-key-change-in-production-2024
NODE_ENV=development
`;
  
  fs.writeFileSync(envPath, defaultEnv);
  console.log('✓ .env file created!');
  process.exit(0);
}

// Read and fix .env file
let envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let fixed = false;

const newLines = lines.map(line => {
  if (line.trim().startsWith('MONGODB_URI=')) {
    const value = line.split('=').slice(1).join('=').trim();
    
    // Check if it's a valid connection string
    if (!value || (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://'))) {
      console.log('✗ Invalid MONGODB_URI found!');
      console.log('  Current value:', value.substring(0, 50) + '...');
      return line; // Keep original, user needs to fix manually
    }
    
    // Fix missing database name
    if (value.includes('mongodb+srv://')) {
      if (value.includes('.mongodb.net/?')) {
        const fixed = value.replace('.mongodb.net/?', '.mongodb.net/dwarika?');
        console.log('✓ Fixed MONGODB_URI: Added /dwarika before ?');
        fixed = true;
        return `MONGODB_URI=${fixed}`;
      } else if (value.match(/\.mongodb\.net$/)) {
        const fixed = value + '/dwarika';
        console.log('✓ Fixed MONGODB_URI: Added /dwarika at the end');
        fixed = true;
        return `MONGODB_URI=${fixed}`;
      } else if (!value.match(/\.mongodb\.net\/[^\/\?]+/)) {
        const fixed = value.replace(/(\.mongodb\.net)(\?|$)/, '$1/dwarika$2');
        console.log('✓ Fixed MONGODB_URI: Added /dwarika');
        fixed = true;
        return `MONGODB_URI=${fixed}`;
      }
    }
  }
  return line;
});

if (fixed) {
  fs.writeFileSync(envPath, newLines.join('\n'));
  console.log('\n✓ .env file updated!');
} else {
  console.log('✓ .env file looks good');
}

// Display current MONGODB_URI (hide password)
const mongodbLine = newLines.find(l => l.trim().startsWith('MONGODB_URI='));
if (mongodbLine) {
  const uri = mongodbLine.split('=').slice(1).join('=').trim();
  const hidden = uri.replace(/:[^:@]+@/, ':****@');
  console.log('\nCurrent MONGODB_URI:', hidden);
}

process.exit(0);

