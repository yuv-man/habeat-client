#!/usr/bin/env node

/**
 * Script to display iOS configuration instructions
 * Provides the reversed client ID needed for Info.plist URL scheme
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const rootDir = join(__dirname, '..');

// Load environment variables from .env file
const envPath = join(rootDir, '.env');
let iosClientId = '';
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (key === 'VITE_GOOGLE_CLIENT_ID_IOS') {
        iosClientId = value;
      }
    }
  });
}

if (!iosClientId) {
  console.log('⚠️  VITE_GOOGLE_CLIENT_ID_IOS not found in .env file');
  console.log('   Please add it to your .env file');
  process.exit(1);
}

// Extract reversed client ID
// iOS client ID format: com.googleusercontent.apps.CLIENT_ID
// Reversed format: com.googleusercontent.apps.CLIENT_ID (same, but used as URL scheme)
const reversedClientId = iosClientId;

console.log('\n📱 iOS Configuration Instructions:');
console.log('=====================================\n');
console.log('Your iOS Client ID:', iosClientId);
console.log('Reversed Client ID (for URL scheme):', reversedClientId);
console.log('\n📋 Manual Steps Required in Xcode:');
console.log('1. Open Xcode: npm run cap:open:ios');
console.log('2. Select your app target → Info tab');
console.log('3. Under "URL Types", click the "+" button');
console.log('4. Set the following:');
console.log('   - Identifier: GoogleSignIn');
console.log('   - URL Schemes: ' + reversedClientId);
console.log('\n✅ After completing these steps, you can build and run the app!\n');
