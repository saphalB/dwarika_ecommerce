import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('Fixing .env file...\n');

if (!fs.existsSync(envPath)) {
  console.log('Creating new .env file...');
  const defaultEnv = `PORT=5000
MONGODB_URI=mongodb+srv://db_user:KgNu6aK9b3HfEi48@dwarika.4cuq2sy.mongodb.net/dwarika?appName=dwarika
JWT_SECRET=dwarika-secret-key-change-in-production-2024
NODE_ENV=development
`;
  fs.writeFileSync(envPath, defaultEnv);
  console.log('✓ .env file created!');
  process.exit(0);
}

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf8');
console.log('Current .env content:');
console.log(envContent);
console.log('\n---\n');

// Fix the MONGODB_URI line
const lines = envContent.split('\n');
const fixedLines = lines.map(line => {
  const trimmed = line.trim();
  
  // Fix duplicate MONGODB_URI=
  if (trimmed.startsWith('MONGODB_URI=')) {
    let value = line.split('=').slice(1).join('=').trim();
    
    // Remove duplicate MONGODB_URI= if present
    if (value.startsWith('MONGODB_URI=')) {
      value = value.replace('MONGODB_URI=', '');
    }
    
    // Ensure database name is in connection string
    if (value.includes('mongodb+srv://')) {
      if (value.includes('.mongodb.net/?')) {
        value = value.replace('.mongodb.net/?', '.mongodb.net/dwarika?');
      } else if (value.match(/\.mongodb\.net$/)) {
        value = value + '/dwarika';
      } else if (!value.match(/\.mongodb\.net\/[^\/\?]+/)) {
        value = value.replace(/(\.mongodb\.net)(\?|$)/, '$1/dwarika$2');
      }
    }
    
    return `MONGODB_URI=${value}`;
  }
  
  return line;
});

// Write fixed content
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(envPath, fixedContent);

console.log('Fixed .env content:');
console.log(fixedContent);
console.log('\n✓ .env file fixed!');

process.exit(0);

