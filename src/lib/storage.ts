/**
 * Hybrid storage adapter for Capacitor apps
 * Uses Capacitor Preferences API on native platforms (iOS/Android)
 * Falls back to localStorage on web
 * 
 * This ensures reliable storage on mobile devices where localStorage
 * can be cleared by the OS under low storage conditions.
 */

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { isNativePlatform } from "./platform";

/**
 * Storage adapter interface matching localStorage API
 */
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Capacitor Preferences storage adapter (for native iOS/Android)
 */
class CapacitorStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error(`Error getting item ${key} from Capacitor Preferences:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error(`Error setting item ${key} in Capacitor Preferences:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Error removing item ${key} from Capacitor Preferences:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error("Error clearing Capacitor Preferences:", error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error("Error getting keys from Capacitor Preferences:", error);
      return [];
    }
  }
}

/**
 * localStorage storage adapter (for web/PWA)
 */
class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error("Error getting keys from localStorage:", error);
      return [];
    }
  }
}

// Create the appropriate adapter based on platform
let storageAdapter: StorageAdapter;

// Initialize storage adapter
const initStorageAdapter = (): StorageAdapter => {
  // Check if we're on native platform and Capacitor Preferences is available
  if (isNativePlatform() && Capacitor.isPluginAvailable("Preferences")) {
    return new CapacitorStorageAdapter();
  }
  // Fallback to localStorage for web or if Preferences plugin is not available
  return new LocalStorageAdapter();
};

// Lazy initialization - only create adapter when first used
const getStorageAdapter = (): StorageAdapter => {
  if (!storageAdapter) {
    storageAdapter = initStorageAdapter();
  }
  return storageAdapter;
};

/**
 * Get item from storage (async)
 */
export const storageGetItem = async (key: string): Promise<string | null> => {
  return getStorageAdapter().getItem(key);
};

/**
 * Set item in storage (async)
 */
export const storageSetItem = async (key: string, value: string): Promise<void> => {
  return getStorageAdapter().setItem(key, value);
};

/**
 * Remove item from storage (async)
 */
export const storageRemoveItem = async (key: string): Promise<void> => {
  return getStorageAdapter().removeItem(key);
};

/**
 * Clear all storage (async)
 */
export const storageClear = async (): Promise<void> => {
  return getStorageAdapter().clear();
};

/**
 * Get all keys from storage (async)
 */
export const storageGetAllKeys = async (): Promise<string[]> => {
  return getStorageAdapter().getAllKeys();
};

/**
 * Synchronous getItem for compatibility with Zustand persist
 * NOTE: On native platforms, this uses a sync cache for immediate reads
 * The cache is populated async on app start
 */
const syncCache: Map<string, string> = new Map();

// Initialize sync cache from storage on app start
// This ensures Zustand persist can read cached data synchronously on native platforms
if (typeof window !== "undefined") {
  // Use a small delay to ensure Capacitor is ready
  setTimeout(async () => {
    try {
      if (isNativePlatform() && Capacitor.isPluginAvailable("Preferences")) {
        const keys = await storageGetAllKeys();
        for (const key of keys) {
          const value = await storageGetItem(key);
          if (value !== null) {
            syncCache.set(key, value);
          }
        }
        console.log(`Initialized sync cache with ${syncCache.size} items`);
      }
    } catch (error) {
      console.error("Error initializing sync cache:", error);
    }
  }, 100);
}

export const storageGetItemSync = (key: string): string | null => {
  if (isNativePlatform() && Capacitor.isPluginAvailable("Preferences")) {
    // Return from sync cache
    return syncCache.get(key) || null;
  }
  return localStorage.getItem(key);
};

/**
 * Synchronous setItem for compatibility with Zustand persist
 * NOTE: On native platforms, updates sync cache immediately and queues async write
 */
export const storageSetItemSync = (key: string, value: string): void => {
  if (isNativePlatform() && Capacitor.isPluginAvailable("Preferences")) {
    // Update sync cache immediately
    syncCache.set(key, value);
    // Queue async write
    getStorageAdapter().setItem(key, value).catch((error) => {
      console.error(`Failed to set item ${key} async:`, error);
      // Remove from cache on error
      syncCache.delete(key);
    });
    return;
  }
  localStorage.setItem(key, value);
};

/**
 * Synchronous removeItem for compatibility with Zustand persist
 */
export const storageRemoveItemSync = (key: string): void => {
  if (isNativePlatform() && Capacitor.isPluginAvailable("Preferences")) {
    // Remove from sync cache immediately
    syncCache.delete(key);
    // Queue async remove
    getStorageAdapter().removeItem(key).catch((error) => {
      console.error(`Failed to remove item ${key} async:`, error);
    });
    return;
  }
  localStorage.removeItem(key);
};

/**
 * Check if storage is available
 */
export const isStorageAvailable = (): boolean => {
  if (isNativePlatform()) {
    return Capacitor.isPluginAvailable("Preferences");
  }
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
