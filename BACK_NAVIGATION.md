# Back Navigation for Mobile Apps

## Overview

The app now supports native back navigation gestures and hardware back button on mobile devices:

- **Android**:
  - Hardware back button navigates back through app history
  - Gesture navigation (swipe from left/right edge on Pixel and other devices) - works automatically
- **iOS**: Swipe from left edge navigates back (handled by WebView + React Router)
- **Smart Exit**: On root pages (`/`, `/register`), back button/gesture exits the app
- **History Management**: Tracks navigation history and allows going back through visited pages

> **Note**: Android gesture navigation (default on Pixel phones and Android 10+) triggers the same `backButton` event as the hardware button, so both work seamlessly with this implementation.

## How It Works

### Implementation

1. **BackNavigationHandler Component** (`src/components/navigation/BackNavigationHandler.tsx`)

   - Placed at the root level in `App.tsx`
   - Handles global back navigation for the entire app
   - Configures which routes should exit the app vs navigate back

2. **useBackNavigation Hook** (`src/hooks/useBackNavigation.ts`)
   - Listens for Capacitor App plugin's `backButton` event
   - Manages navigation history
   - Handles route-specific behavior (exit vs navigate)

### Features

✅ **Hardware Back Button** (Android)

- Pressing back button navigates to previous page
- On root pages, exits the app

✅ **Gesture Navigation** (Android - Pixel & Android 10+)

- Swipe from left or right edge navigates back
- Works automatically - triggers the same `backButton` event
- No additional configuration needed

✅ **Swipe Gestures** (iOS)

- Swipe from left edge navigates back
- Handled automatically by WebView + React Router

✅ **Smart History Management**

- Tracks visited pages
- Prevents duplicate entries
- Limits history to last 50 pages

✅ **Route-Specific Behavior**

- Exit routes: `/`, `/register` → Exit app
- Disabled routes: `/auth/callback` → No back navigation
- All other routes → Navigate back

## Configuration

### Customizing Exit Routes

Edit `src/components/navigation/BackNavigationHandler.tsx`:

```typescript
useBackNavigation({
  exitRoutes: ["/", "/register"], // Routes that exit the app
  disabledRoutes: ["/auth/callback"], // Routes where back is disabled
});
```

### Custom Back Handler

You can add custom logic for specific pages:

```typescript
useBackNavigation({
  onBack: () => {
    // Check if modal is open, close it first
    if (isModalOpen) {
      closeModal();
      return false; // Prevent default navigation
    }
    return true; // Allow default navigation
  },
});
```

### Per-Page Back Navigation

Individual pages can use the hook with custom behavior:

```typescript
import { useBackNavigation } from "@/hooks/useBackNavigation";

function MyPage() {
  useBackNavigation({
    onBack: () => {
      // Custom logic for this page
      if (hasUnsavedChanges) {
        showConfirmDialog();
        return false; // Prevent navigation
      }
      return true;
    },
  });

  return <div>...</div>;
}
```

## Testing

### Android

1. Build and install the app
2. Navigate through several pages
3. Test hardware back button:
   - Press hardware back button (if available)
   - Should navigate back through history
   - On home page, should exit app
4. Test gesture navigation (Pixel & Android 10+):
   - Swipe from left or right edge
   - Should navigate back through history (same as hardware button)
   - On home page, should exit app

### iOS

1. Build and install the app
2. Navigate through several pages
3. Swipe from left edge
4. Should navigate back through history
5. On home page, swipe should exit app (or show exit confirmation)

## Troubleshooting

### Back button not working?

1. **Check Capacitor sync**:

   ```bash
   npx cap sync
   ```

2. **Verify App plugin is installed**:

   ```bash
   npm list @capacitor/app
   ```

3. **Check native platform**:
   - Back navigation only works on native platforms
   - Web/PWA uses browser back button (automatic)

### iOS swipe not working?

iOS swipe gestures are handled by the WebView automatically. If not working:

1. Ensure you're using `BrowserRouter` (already configured)
2. Check iOS WebView settings in `capacitor.config.json`
3. Verify app is running in native context, not browser

### Want to disable back navigation?

Set `enabled: false`:

```typescript
useBackNavigation({
  enabled: false,
});
```

## Technical Details

- Uses `@capacitor/app` plugin for Android back button
- Uses React Router's `navigate(-1)` for history navigation
- Tracks navigation history in memory (not persisted)
- History is limited to last 50 pages to prevent memory issues
- Only active on native platforms (iOS/Android), not web

## Files Modified

- `src/App.tsx` - Added BackNavigationHandler component
- `src/hooks/useBackNavigation.ts` - New hook for back navigation
- `src/components/navigation/BackNavigationHandler.tsx` - Global handler component
- `package.json` - Added `@capacitor/app` dependency
