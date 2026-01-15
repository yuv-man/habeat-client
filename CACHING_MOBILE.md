# Caching Implementation for Mobile (Native) Apps

## Overview

The caching system has been optimized to work reliably on **native iOS and Android** apps built with Capacitor, while maintaining compatibility with web browsers.

## How It Works on Mobile

### Storage Backend

The app uses a **hybrid storage adapter** that automatically selects the best storage mechanism:

- **Native iOS/Android**: Uses `@capacitor/preferences` API
  - Stores data in native OS storage (UserDefaults on iOS, SharedPreferences on Android)
  - More reliable - data persists even if WebView cache is cleared
  - Data survives app updates and restarts
  - Protected by app sandboxing

- **Web/PWA**: Falls back to `localStorage`
  - Standard web storage API
  - Fast synchronous access
  - Works in all modern browsers

### Cache Strategy

1. **Cache-First Loading**
   - Cached data is shown **immediately** when available
   - No waiting for API calls on app startup
   - Background refresh updates data silently

2. **TTL (Time To Live) Expiration**
   - Different cache durations for different data types:
     - **Auth data**: 5 minutes
     - **Daily progress**: 2 minutes  
     - **Goals**: 10 minutes
     - **Meal plans**: 30 minutes
     - **Favorites**: 15 minutes

3. **Date-Aware Caching**
   - Daily tracker cache automatically invalidates when date changes
   - Ensures fresh data each day

4. **Offline Support**
   - Falls back to stale cache if network fails
   - App remains functional even without internet

## Technical Implementation

### Storage Adapter (`src/lib/storage.ts`)

The storage adapter provides a unified interface that works on both native and web:

```typescript
// Async API (recommended for native)
await storageGetItem(key);
await storageSetItem(key, value);
await storageRemoveItem(key);

// Sync API (for Zustand persist compatibility)
storageGetItemSync(key);
storageSetItemSync(key, value);
storageRemoveItemSync(key);
```

### Sync Cache for Zustand

Since Zustand's `persist` middleware requires synchronous storage, we maintain an in-memory sync cache:

- On app start, all Capacitor Preferences are loaded into memory
- Reads are instant (from memory)
- Writes update memory immediately and persist async to native storage
- This ensures Zustand works seamlessly on native platforms

### Cache Utility (`src/lib/cache.ts`)

Provides TTL-aware caching with automatic expiration:

```typescript
// Get cached data (sync version for Zustand)
const data = getCachedDataSync<MyType>("my-key");

// Set cached data (sync version)
setCachedDataSync("my-key", data, DEFAULT_TTL.PROGRESS);

// Clear expired cache
clearExpiredCacheSync();
```

## Benefits for Mobile Users

✅ **Instant App Startup** - Cached data loads immediately  
✅ **Offline Functionality** - App works without internet  
✅ **Reliable Storage** - Data persists even if OS clears WebView cache  
✅ **Background Updates** - Fresh data loads silently in background  
✅ **Battery Efficient** - Fewer API calls = less network usage  
✅ **Smooth UX** - No loading spinners for cached data  

## Testing on Mobile

To test the caching on a native device:

1. **Build and install the app**:
   ```bash
   npm run build:mobile
   npx cap open ios  # or android
   ```

2. **Test scenarios**:
   - Open app → Should load instantly from cache
   - Turn off internet → App should still work with cached data
   - Wait 2+ minutes → Background refresh should update data
   - Close and reopen app → Should load instantly again

3. **Verify storage**:
   - Check Capacitor Preferences in native debugger
   - Data should persist across app restarts
   - Cache should expire based on TTL settings

## Troubleshooting

### Cache not working on native?

1. Ensure `@capacitor/preferences` is installed:
   ```bash
   npm install @capacitor/preferences
   ```

2. Sync Capacitor plugins:
   ```bash
   npx cap sync
   ```

3. Check if Preferences plugin is available:
   ```typescript
   import { Capacitor } from "@capacitor/core";
   Capacitor.isPluginAvailable("Preferences") // should be true
   ```

### Storage quota exceeded?

The cache utility automatically clears expired entries when storage is full. If issues persist:

- Reduce TTL values in `src/lib/cache.ts`
- Implement more aggressive cache cleanup
- Consider using SQLite for larger datasets

## Files Modified

- `src/lib/storage.ts` - Hybrid storage adapter
- `src/lib/cache.ts` - TTL-aware cache utility  
- `src/stores/progressStore.ts` - Daily tracker caching
- `src/stores/authStore.ts` - Auth data caching
- `src/stores/goalsStore.ts` - Goals caching
- `src/App.tsx` - Cache cleanup on startup

## Future Enhancements

- [ ] Add cache size limits
- [ ] Implement cache compression for large data
- [ ] Add cache analytics/metrics
- [ ] Support for cache invalidation webhooks
- [ ] Background sync service for offline-first experience
