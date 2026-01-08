#!/usr/bin/env node

/**
 * Script to configure iOS Info.plist with Google Sign-In URL schemes
 * This sets up the reversed client ID as a URL scheme for OAuth callbacks
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { parseString, Builder } = require('xml2js');

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
  console.log('   Skipping iOS URL scheme configuration');
  process.exit(0);
}

// Reverse the client ID (e.g., com.googleusercontent.apps.123456 -> com.googleusercontent.apps.123456:)
// Actually, the reversed client ID format is: com.googleusercontent.apps.CLIENT_ID
// But we need to extract the client ID part and reverse it
const reversedClientId = iosClientId.split('.').reverse().join('.');

const infoPlistPath = join(rootDir, 'ios/App/App/Info.plist');

if (!existsSync(infoPlistPath)) {
  console.error('❌ Info.plist not found at:', infoPlistPath);
  process.exit(1);
}

// Read and parse Info.plist
const plistContent = readFileSync(infoPlistPath, 'utf8');

parseString(plistContent, (err, result) => {
  if (err) {
    console.error('❌ Failed to parse Info.plist:', err);
    process.exit(1);
  }

  const dict = result.plist.dict[0];
  
  // Find or create URLTypes array
  let urlTypesIndex = -1;
  const keys = dict.key || [];
  const values = dict.array || dict.string || dict.true || dict.false || dict.integer || [];
  
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'CFBundleURLTypes') {
      urlTypesIndex = i;
      break;
    }
  }

  if (urlTypesIndex === -1) {
    // Create new URLTypes entry
    dict.key = dict.key || [];
    dict.array = dict.array || [];
    dict.key.push('CFBundleURLTypes');
    
    const newUrlType = {
      dict: [{
        key: ['CFBundleURLName', 'CFBundleURLSchemes'],
        array: [
          {
            string: ['GoogleSignIn']
          },
          {
            string: [reversedClientId]
          }
        ]
      }]
    };
    dict.array.push(newUrlType);
  } else {
    // Check if GoogleSignIn URL scheme already exists
    const urlTypes = dict.array[urlTypesIndex];
    let googleSignInExists = false;
    
    if (urlTypes && urlTypes.dict) {
      for (const urlType of urlTypes.dict) {
        if (urlType.key && urlType.key.includes('CFBundleURLSchemes')) {
          const schemesIndex = urlType.key.indexOf('CFBundleURLSchemes');
          if (urlType.array && urlType.array[schemesIndex]) {
            const schemes = urlType.array[schemesIndex].string || [];
            if (schemes.includes(reversedClientId)) {
              googleSignInExists = true;
              break;
            }
          }
        }
      }
    }
    
    if (!googleSignInExists) {
      // Add new URL type for Google Sign-In
      if (!urlTypes.dict) {
        urlTypes.dict = [];
      }
      urlTypes.dict.push({
        key: ['CFBundleURLName', 'CFBundleURLSchemes'],
        array: [
          {
            string: ['GoogleSignIn']
          },
          {
            string: [reversedClientId]
          }
        ]
      });
    }
  }

  // Convert back to XML
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    doctype: { pubID: '-//Apple//DTD PLIST 1.0//EN', sysID: 'http://www.apple.com/DTDs/PropertyList-1.0.dtd' }
  });
  
  const xml = builder.buildObject(result);
  writeFileSync(infoPlistPath, xml);
  console.log('✅ iOS Info.plist configured with Google Sign-In URL scheme');
  console.log('   URL Scheme:', reversedClientId);
});

