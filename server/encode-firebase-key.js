// Temporary script to encode Firebase service account
// Usage: node encode-firebase-key.js path/to/serviceAccount.json

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Please provide path to service account JSON file');
  console.log('Usage: node encode-firebase-key.js path/to/serviceAccount.json');
  process.exit(1);
}

const filePath = args[0];

try {
  const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('\n✅ Service account loaded successfully\n');
  console.log('📋 Copy these values to Vercel environment variables:\n');
  console.log('FIREBASE_PROJECT_ID=');
  console.log(serviceAccount.project_id);
  console.log('\nFIREBASE_CLIENT_EMAIL=');
  console.log(serviceAccount.client_email);
  console.log('\nFIREBASE_PRIVATE_KEY=');
  console.log(serviceAccount.private_key);
  console.log('\n');
  
  // Also show base64 encoded version as backup
  const base64 = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Alternative: Base64 encoded (if above doesn\'t work)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('FIREBASE_SERVICE_ACCOUNT_BASE64=');
  console.log(base64);
  console.log('\n');
  
} catch (error) {
  console.error('❌ Error reading service account:', error.message);
  process.exit(1);
}
