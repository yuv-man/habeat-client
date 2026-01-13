import { Capacitor } from "@capacitor/core";

/**
 * Check if Google Auth should use mobile mode
 * Can be forced via VITE_GOOGLE_AUTH_MODE env variable, otherwise detects platform
 * @returns true if should use mobile auth, false if should use web auth
 */
export const shouldUseMobileAuth = (): boolean => {
  // Check for explicit mode override
  const authMode = import.meta.env.VITE_GOOGLE_AUTH_MODE;
  if (authMode === "mobile") return true;
  if (authMode === "web") return false;
  
  // Default: detect platform
  return Capacitor.isNativePlatform();
};

/**
 * Check if the app is running on a native mobile platform (iOS/Android)
 * @returns true if running on native mobile, false if running on web
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if the app is running on web
 * @returns true if running on web, false if running on native mobile
 */
export const isWebPlatform = (): boolean => {
  return !isNativePlatform();
};

/**
 * Get the current platform name
 * @returns 'ios' | 'android' | 'web'
 */
export const getPlatform = (): "ios" | "android" | "web" => {
  if (Capacitor.getPlatform() === "ios") return "ios";
  if (Capacitor.getPlatform() === "android") return "android";
  return "web";
};
