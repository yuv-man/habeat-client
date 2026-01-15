/**
 * Cache utility with TTL (Time To Live) support
 * Provides cache expiration and invalidation for mobile app performance
 * 
 * Uses Capacitor Preferences API on native platforms for reliable storage
 * Falls back to localStorage on web
 */

import {
  storageGetItem,
  storageSetItem,
  storageRemoveItem,
  storageGetAllKeys,
} from "./storage";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheConfig {
  ttl?: number; // Default TTL in milliseconds
  keyPrefix?: string; // Prefix for cache keys
}

const DEFAULT_TTL = {
  // Cache durations in milliseconds
  AUTH: 5 * 60 * 1000, // 5 minutes - auth data refreshes frequently
  PROGRESS: 2 * 60 * 1000, // 2 minutes - daily progress updates frequently
  GOALS: 10 * 60 * 1000, // 10 minutes - goals change less frequently
  PLAN: 30 * 60 * 1000, // 30 minutes - meal plans are relatively stable
  FAVORITES: 15 * 60 * 1000, // 15 minutes - favorites change occasionally
};

/**
 * Check if a cache entry is still valid
 */
export function isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
  if (!entry) return false;
  const now = Date.now();
  const age = now - entry.timestamp;
  return age < entry.ttl;
}

/**
 * Get cached data if valid, otherwise return null
 * NOTE: This is async on native platforms. Use await or .then()
 */
export async function getCachedData<T>(
  key: string,
  config?: CacheConfig
): Promise<T | null> {
  try {
    const fullKey = config?.keyPrefix
      ? `${config.keyPrefix}_${key}`
      : `cache_${key}`;
    const cached = await storageGetItem(fullKey);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (isCacheValid(entry)) {
      return entry.data;
    }

    // Cache expired, remove it
    await storageRemoveItem(fullKey);
    return null;
  } catch (error) {
    console.error(`Error reading cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Synchronous version for compatibility (web only)
 * On native platforms, returns null - use async version instead
 */
export function getCachedDataSync<T>(
  key: string,
  config?: CacheConfig
): T | null {
  try {
    const fullKey = config?.keyPrefix
      ? `${config.keyPrefix}_${key}`
      : `cache_${key}`;
    const cached = localStorage.getItem(fullKey);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (isCacheValid(entry)) {
      return entry.data;
    }

    // Cache expired, remove it
    localStorage.removeItem(fullKey);
    return null;
  } catch (error) {
    console.error(`Error reading cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cached data with TTL (async)
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl?: number,
  config?: CacheConfig
): Promise<void> {
  try {
    const fullKey = config?.keyPrefix
      ? `${config.keyPrefix}_${key}`
      : `cache_${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || config?.ttl || DEFAULT_TTL.PROGRESS,
    };
    await storageSetItem(fullKey, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    // If storage is full, try to clear old cache entries
    if (error instanceof Error && error.message.includes("QuotaExceededError")) {
      await clearExpiredCache();
      // Retry once
      try {
        const fullKey = config?.keyPrefix
          ? `${config.keyPrefix}_${key}`
          : `cache_${key}`;
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl: ttl || config?.ttl || DEFAULT_TTL.PROGRESS,
        };
        await storageSetItem(fullKey, JSON.stringify(entry));
      } catch (retryError) {
        console.error(`Failed to cache after cleanup:`, retryError);
      }
    }
  }
}

/**
 * Synchronous version for compatibility (web only)
 */
export function setCachedDataSync<T>(
  key: string,
  data: T,
  ttl?: number,
  config?: CacheConfig
): void {
  try {
    const fullKey = config?.keyPrefix
      ? `${config.keyPrefix}_${key}`
      : `cache_${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || config?.ttl || DEFAULT_TTL.PROGRESS,
    };
    localStorage.setItem(fullKey, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    // If storage is full, try to clear old cache entries
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearExpiredCacheSync();
      // Retry once
      try {
        const fullKey = config?.keyPrefix
          ? `${config.keyPrefix}_${key}`
          : `cache_${key}`;
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl: ttl || config?.ttl || DEFAULT_TTL.PROGRESS,
        };
        localStorage.setItem(fullKey, JSON.stringify(entry));
      } catch (retryError) {
        console.error(`Failed to cache after cleanup:`, retryError);
      }
    }
  }
}

/**
 * Remove cached data (async)
 */
export async function removeCachedData(
  key: string,
  config?: CacheConfig
): Promise<void> {
  try {
    const fullKey = config?.keyPrefix
      ? `${config.keyPrefix}_${key}`
      : `cache_${key}`;
    await storageRemoveItem(fullKey);
  } catch (error) {
    console.error(`Error removing cache for key ${key}:`, error);
  }
}

/**
 * Synchronous version for compatibility (web only)
 */
export function removeCachedDataSync(key: string, config?: CacheConfig): void {
  try {
    const fullKey = config?.keyPrefix
      ? `${config.keyPrefix}_${key}`
      : `cache_${key}`;
    localStorage.removeItem(fullKey);
  } catch (error) {
    console.error(`Error removing cache for key ${key}:`, error);
  }
}

/**
 * Clear all expired cache entries (async)
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const keys = await storageGetAllKeys();
    let clearedCount = 0;

    for (const key of keys) {
      if (key.startsWith("cache_") || key.includes("_cache_")) {
        try {
          const cached = await storageGetItem(key);
          if (cached) {
            const entry: CacheEntry<unknown> = JSON.parse(cached);
            if (!isCacheValid(entry)) {
              await storageRemoveItem(key);
              clearedCount++;
            }
          }
        } catch (error) {
          // Invalid cache entry, remove it
          await storageRemoveItem(key);
          clearedCount++;
        }
      }
    }

    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} expired cache entries`);
    }
  } catch (error) {
    console.error("Error clearing expired cache:", error);
  }
}

/**
 * Synchronous version for compatibility (web only)
 */
export function clearExpiredCacheSync(): void {
  try {
    const keys = Object.keys(localStorage);
    let clearedCount = 0;

    for (const key of keys) {
      if (key.startsWith("cache_") || key.includes("_cache_")) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<unknown> = JSON.parse(cached);
            if (!isCacheValid(entry)) {
              localStorage.removeItem(key);
              clearedCount++;
            }
          }
        } catch (error) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
          clearedCount++;
        }
      }
    }

    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} expired cache entries`);
    }
  } catch (error) {
    console.error("Error clearing expired cache:", error);
  }
}

/**
 * Clear all cache entries (use with caution) - async
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await storageGetAllKeys();
    for (const key of keys) {
      if (key.startsWith("cache_") || key.includes("_cache_")) {
        await storageRemoveItem(key);
      }
    }
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
}

/**
 * Synchronous version for compatibility (web only)
 */
export function clearAllCacheSync(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("cache_") || key.includes("_cache_")) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
}

/**
 * Get cache age in milliseconds (async)
 */
export async function getCacheAge(
  key: string,
  config?: CacheConfig
): Promise<number | null> {
  try {
    const fullKey = config?.keyPrefix
      ? `${config.keyPrefix}_${key}`
      : `cache_${key}`;
    const cached = await storageGetItem(fullKey);
    if (!cached) return null;

    const entry: CacheEntry<unknown> = JSON.parse(cached);
    return Date.now() - entry.timestamp;
  } catch (error) {
    return null;
  }
}

export { DEFAULT_TTL };
