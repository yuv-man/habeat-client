#!/usr/bin/env node

/**
 * Script to sync environment variables to capacitor.config.json
 * This ensures the Google Client ID is properly set for mobile builds
 */

const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");

const rootDir = join(__dirname, "..");

// Load environment variables from .env file if it exists
const envPath = join(rootDir, ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const capacitorConfigPath = join(rootDir, "capacitor.config.json");
const capacitorConfig = JSON.parse(readFileSync(capacitorConfigPath, "utf8"));

// Replace environment variable placeholders
// Use web client ID as serverClientId (for backend verification)
const webClientId = process.env.VITE_GOOGLE_CLIENT_ID || "";
const iosClientId = process.env.VITE_GOOGLE_CLIENT_ID_IOS || "";
const androidClientId = process.env.VITE_GOOGLE_CLIENT_ID_ANDROID || "";

// Configure SocialLogin plugin (replaces GoogleAuth)
if (capacitorConfig.plugins?.SocialLogin) {
  if (!capacitorConfig.plugins.SocialLogin.google) {
    capacitorConfig.plugins.SocialLogin.google = {};
  }

  // Set web client ID (used for backend verification)
  if (webClientId) {
    capacitorConfig.plugins.SocialLogin.google.webClientId = webClientId;
  }

  // Set iOS client ID if provided
  if (iosClientId) {
    capacitorConfig.plugins.SocialLogin.google.iosClientId = iosClientId;
  }

  // Set Android client ID if provided
  if (androidClientId) {
    capacitorConfig.plugins.SocialLogin.google.androidClientId =
      androidClientId;
  }
}

// Keep GoogleAuth config for backward compatibility (can be removed later)
if (capacitorConfig.plugins?.GoogleAuth) {
  capacitorConfig.plugins.GoogleAuth.serverClientId = webClientId;
  if (iosClientId) {
    capacitorConfig.plugins.GoogleAuth.iosClientId = iosClientId;
  }
  if (androidClientId) {
    capacitorConfig.plugins.GoogleAuth.androidClientId = androidClientId;
  }
}

// Write back to file
writeFileSync(
  capacitorConfigPath,
  JSON.stringify(capacitorConfig, null, 2) + "\n"
);
console.log("✅ Capacitor config synced with environment variables");
if (capacitorConfig.plugins?.SocialLogin?.google) {
  console.log("   SocialLogin (Google): Configured");
  if (iosClientId) console.log("   iOS Client ID: Configured");
  if (androidClientId) console.log("   Android Client ID: Configured");
}
