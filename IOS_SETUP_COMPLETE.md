# iOS Setup Complete Guide

Follow these steps to run your app in Xcode:

## ✅ Prerequisites Completed

- ✅ Web app built (`dist/` folder)
- ✅ Capacitor configured
- ✅ Google Auth plugin installed
- ✅ Environment variables configured

## 📋 Step-by-Step iOS Setup

### 1. Install iOS Dependencies

```bash
npm run ios:pod:install
```

This installs CocoaPods dependencies required for iOS.

### 2. Configure Google Sign-In URL Scheme

Run this command to see your iOS configuration details:

```bash
npm run cap:setup:ios
```

This will display:

- Your iOS Client ID
- The URL scheme you need to add in Xcode

### 3. Open Xcode

```bash
npm run cap:open:ios
```

### 4. Configure URL Scheme in Xcode

1. In Xcode, select your **app target** (top left, should say "App")
2. Click on the **Info** tab
3. Scroll down to **URL Types** section
4. Click the **+** button to add a new URL Type
5. Set:
   - **Identifier**: `GoogleSignIn`
   - **URL Schemes**: (Use the value shown by `npm run cap:setup:ios`)
     - This is typically your iOS Client ID (e.g., `com.googleusercontent.apps.YOUR_CLIENT_ID`)

### 5. Add GoogleService-Info.plist (if using Firebase)

If you're using Firebase for Google Sign-In:

1. Download `GoogleService-Info.plist` from Firebase Console
2. In Xcode, right-click on the **App** folder (in the left sidebar)
3. Select **Add Files to "App"...**
4. Select your `GoogleService-Info.plist` file
5. Make sure **"Copy items if needed"** is checked
6. Click **Add**

### 6. Select Your Development Team

1. In Xcode, select your **app target**
2. Go to **Signing & Capabilities** tab
3. Under **Signing**, check **"Automatically manage signing"**
4. Select your **Team** from the dropdown
5. Xcode will automatically configure your Bundle Identifier

### 7. Select a Simulator or Device

- **For Simulator**: Select any iOS simulator from the device dropdown (top toolbar)
- **For Physical Device**:
  - Connect your iPhone via USB
  - Trust the computer on your iPhone
  - Select your device from the device dropdown

### 8. Build and Run

Click the **Play** button (▶️) in Xcode or press `⌘R`

## 🔧 Troubleshooting

### Issue: "No such module 'Capacitor'"

**Solution**: Run `npm run ios:pod:install` again

### Issue: Google Sign-In not working

**Check**:

1. URL scheme is correctly configured in Info.plist
2. iOS Client ID matches your Google Cloud Console configuration
3. Bundle ID matches your Google Cloud Console OAuth client

### Issue: Build errors

**Solution**:

1. Clean build folder: `Product` → `Clean Build Folder` (⇧⌘K)
2. Close and reopen Xcode
3. Run `npm run cap:sync` again

### Issue: "Signing for App requires a development team"

**Solution**:

1. Go to **Signing & Capabilities** tab
2. Select your Apple Developer account team
3. If you don't have one, create a free Apple ID account

## 📱 Testing Google Sign-In

1. Run the app in simulator or device
2. Navigate to sign-in screen
3. Tap "Continue with Google"
4. You should see the native Google Sign-In flow
5. After signing in, you should be redirected back to the app

## 🎉 You're Ready!

Your iOS app is now configured and ready to run. The app will:

- Use native Google Sign-In on iOS
- Connect to your backend API
- Work offline with cached data
- Have access to all native device features

## Next Steps

- Test all features on iOS
- Configure Android setup (similar process)
- Prepare for App Store submission when ready
