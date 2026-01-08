# Mobile App Setup Guide

This guide will help you complete the mobile app setup for Habeats.

## ✅ Already Completed

- ✅ Capacitor installed and configured
- ✅ iOS and Android platforms added
- ✅ Google Auth plugin configured
- ✅ Platform detection utilities created
- ✅ Unified Google Auth implementation

## 📋 Next Steps

### 1. Add Mobile Build Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build:mobile": "npm run build && npx cap sync",
    "cap:sync": "npx cap sync",
    "cap:open:ios": "npx cap open ios",
    "cap:open:android": "npx cap open android",
    "cap:copy": "npx cap copy",
    "cap:update": "npx cap update"
  }
}
```

### 2. Configure Environment Variables

Create a `.env` file (if not exists) with:

```env
VITE_GOOGLE_CLIENT_ID=your-web-client-id-here
VITE_BASE_URL_DEV=http://localhost:5000/api
VITE_BASE_URL_PROD=https://your-api-url.com/api
```

**Important for Mobile:**
- Use the **WEB CLIENT ID** (not Android/iOS client ID) for `VITE_GOOGLE_CLIENT_ID`
- The `serverClientId` in `capacitor.config.json` should match this

### 3. Build and Sync

```bash
# Build the web app
npm run build

# Sync Capacitor config with environment variables, then sync to native projects
npm run cap:sync

# Or manually:
npm run cap:config  # Sync env vars to capacitor.config.json
npx cap sync         # Copy web build to native projects
```

### 4. iOS Setup

#### 4.1 Install iOS Dependencies

```bash
cd ios/App
pod install
cd ../..
```

#### 4.2 Configure Google Sign-In for iOS

1. Open Xcode:
   ```bash
   npx cap open ios
   ```

2. Add URL Scheme:
   - In Xcode, go to your app target → Info → URL Types
   - Add a new URL Type with:
     - Identifier: `GoogleSignIn`
     - URL Schemes: Your reversed client ID (from GoogleService-Info.plist)

3. Add GoogleService-Info.plist:
   - Download from Firebase Console
   - Drag into Xcode project (make sure "Copy items if needed" is checked)

4. Update Info.plist:
   - Add your Google Client ID to `Info.plist` if needed

#### 4.3 Build and Run

- Select a simulator or device in Xcode
- Click Run (⌘R)

### 5. Android Setup

#### 5.1 Configure Google Sign-In for Android

1. Add `google-services.json`:
   - Download from Firebase Console
   - Place in `android/app/google-services.json`

2. Update `android/app/build.gradle`:
   - Ensure Google Services plugin is applied (already configured)

3. Update `AndroidManifest.xml`:
   - Check that internet permission is present
   - Add any required permissions

#### 5.2 Build and Run

```bash
# Open Android Studio
npx cap open android

# Or build from command line
cd android
./gradlew assembleDebug
```

### 6. App Icons and Splash Screens

#### iOS Icons:
- Place icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Required sizes: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

#### Android Icons:
- Place icons in `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Required densities: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi

#### Splash Screens:
- Use Capacitor Splash Screen plugin or configure manually
- iOS: Update LaunchScreen.storyboard
- Android: Update splash screen resources

### 7. Additional Mobile Considerations

#### 7.1 Status Bar Configuration

Add to `capacitor.config.json`:

```json
{
  "plugins": {
    "StatusBar": {
      "style": "dark",
      "backgroundColor": "#ffffff"
    }
  }
}
```

#### 7.2 Safe Area Handling

Ensure your app handles safe areas (notch, status bar) properly:
- Use CSS `env(safe-area-inset-*)` variables
- Test on devices with notches

#### 7.3 Keyboard Handling

- Ensure inputs scroll into view when keyboard appears
- Consider using `@capacitor/keyboard` plugin if needed

#### 7.4 Network Status

Consider adding network status detection:
```bash
npm install @capacitor/network
```

#### 7.5 App Version Management

Update version in:
- `package.json` (for reference)
- `android/app/build.gradle` (`versionCode`, `versionName`)
- `ios/App/App/Info.plist` (`CFBundleShortVersionString`, `CFBundleVersion`)

### 8. Testing Checklist

- [ ] Build web app successfully
- [ ] Sync to native platforms
- [ ] Test Google Sign-In on iOS
- [ ] Test Google Sign-In on Android
- [ ] Test app navigation
- [ ] Test API calls
- [ ] Test on physical devices (not just simulators)
- [ ] Test app icons display correctly
- [ ] Test splash screen
- [ ] Test keyboard behavior
- [ ] Test safe area handling

### 9. Production Build

#### iOS:
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

#### Android:
```bash
cd android
./gradlew bundleRelease
```
- Upload `app-release.aab` to Google Play Console

### 10. Common Issues & Solutions

**Issue: Google Sign-In not working**
- Verify `serverClientId` matches your WEB client ID
- Check that `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is properly configured
- Ensure URL schemes are configured correctly

**Issue: Build errors**
- Run `npx cap sync` after any web build
- Clean build folders: `npx cap clean`
- For iOS: `cd ios/App && pod install`

**Issue: CORS errors**
- Ensure API URLs are correct in environment variables
- Check that backend allows mobile app origins

**Issue: White screen on launch**
- Check browser console for errors
- Verify `dist` folder is properly synced
- Check `capacitor.config.json` paths

### 11. Useful Commands Reference

```bash
# Build and sync
npm run build && npx cap sync

# Open native IDEs
npx cap open ios
npx cap open android

# Update Capacitor
npx cap update

# Copy web assets
npx cap copy

# Clean and rebuild
npx cap clean
npm run build
npx cap sync
```

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Google Auth Plugin](https://github.com/devatsouth/CapacitorGoogleAuth)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

