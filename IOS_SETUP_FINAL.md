# iOS Setup - Final Steps

## ✅ Good News!

**Capacitor 8 uses Swift Package Manager (SPM), not CocoaPods!**

Your dependencies are already installed and configured. You don't need to run `pod install`.

## 🚀 Quick Start

### 1. Open Xcode

```bash
npm run cap:open:ios
```

### 2. Configure Google Sign-In URL Scheme

First, check your iOS Client ID:

```bash
npm run cap:setup:ios
```

This will show you the URL scheme you need to add.

### 3. In Xcode:

1. **Select your app target** (top left, should say "App")
2. Click the **Info** tab
3. Scroll to **URL Types**
4. Click **+** to add a new URL Type
5. Set:
   - **Identifier**: `GoogleSignIn`
   - **URL Schemes**: (Use the value from step 2 - your iOS Client ID)

### 4. Configure Signing

1. Go to **Signing & Capabilities** tab
2. Check **"Automatically manage signing"**
3. Select your **Team** (Apple Developer account)

### 5. Select Device/Simulator

- Choose an iOS Simulator from the device dropdown, OR
- Connect your iPhone and select it

### 6. Build and Run

Click the **Play** button (▶️) or press `⌘R`

## 📝 Notes

- **No CocoaPods needed** - Capacitor 8 uses Swift Package Manager
- Dependencies are automatically managed by Capacitor
- The Google Auth plugin is already configured via SPM
- Your web app is already synced to the iOS project

## 🔧 Troubleshooting

### "No such module 'Capacitor'"

- Close Xcode
- Run: `npm run cap:sync`
- Reopen Xcode

### Google Sign-In not working

- Verify URL scheme is correctly added in Info tab
- Check that your iOS Client ID matches Google Cloud Console
- Ensure Bundle ID matches your OAuth client configuration

### Build errors

- Clean build: `Product` → `Clean Build Folder` (⇧⌘K)
- Close and reopen Xcode
- Run `npm run cap:sync` again

## ✅ You're Ready!

Your iOS app is configured and ready to run. Just open Xcode and build!
