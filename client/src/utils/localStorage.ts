/**
 * Enhanced localStorage utility with error handling, quota management, and encryption support
 */

export interface StorageOptions {
  /**
   * Time to live in milliseconds. If set, the data will expire after this time.
   */
  ttl?: number;
  /**
   * If true, encrypt the data before storing (basic obfuscation)
   * For production, consider using a proper encryption library
   */
  encrypt?: boolean;
}

interface StoredValue<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export class LocalStorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LocalStorageError';
  }
}

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get estimated localStorage usage in bytes
 */
export const getStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

/**
 * Get storage size in human-readable format
 */
export const getStorageSizeFormatted = (): string => {
  const bytes = getStorageSize();
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Check if there's enough space (very approximate)
 * Most browsers have 5-10MB limit for localStorage
 */
export const hasStorageSpace = (requiredBytes: number = 0): boolean => {
  const currentSize = getStorageSize();
  const maxSize = 5 * 1024 * 1024; // Assume 5MB limit (conservative)
  return currentSize + requiredBytes < maxSize * 0.9; // Leave 10% buffer
};

/**
 * Simple obfuscation (NOT secure encryption - just makes data less readable)
 * For production, use a proper encryption library like crypto-js
 */
const obfuscate = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const deobfuscate = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data; // Return as-is if deobfuscation fails
  }
};

/**
 * Enhanced localStorage wrapper with error handling and features
 */
export const storage = {
  /**
   * Set an item in localStorage with optional TTL and encryption
   */
  setItem: <T>(key: string, value: T, options?: StorageOptions): void => {
    if (!isLocalStorageAvailable()) {
      throw new LocalStorageError('localStorage is not available');
    }

    try {
      const storedValue: StoredValue<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: options?.ttl,
      };

      let serialized = JSON.stringify(storedValue);

      if (options?.encrypt) {
        serialized = obfuscate(serialized);
      }

      // Check if we have space
      const estimatedSize = serialized.length + key.length;
      if (!hasStorageSpace(estimatedSize)) {
        console.warn('localStorage may be running out of space');
      }

      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new LocalStorageError('localStorage quota exceeded', error);
      }
      throw new LocalStorageError(`Failed to set item: ${key}`, error);
    }
  },

  /**
   * Get an item from localStorage with automatic TTL checking
   */
  getItem: <T>(key: string, options?: Pick<StorageOptions, 'encrypt'>): T | null => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }

    try {
      let serialized = localStorage.getItem(key);
      if (serialized === null) {
        return null;
      }

      if (options?.encrypt) {
        serialized = deobfuscate(serialized);
      }

      const storedValue: StoredValue<T> = JSON.parse(serialized);

      // Check if data has expired
      if (storedValue.ttl) {
        const age = Date.now() - storedValue.timestamp;
        if (age > storedValue.ttl) {
          // Data expired, remove it
          localStorage.removeItem(key);
          return null;
        }
      }

      return storedValue.data;
    } catch (error) {
      console.error(`Failed to get item: ${key}`, error);
      // Remove corrupted data
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore removal errors
      }
      return null;
    }
  },

  /**
   * Remove an item from localStorage
   */
  removeItem: (key: string): void => {
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item: ${key}`, error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear: (): void => {
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  },

  /**
   * Remove items by prefix (useful for cache invalidation)
   */
  removeByPrefix: (prefix: string): void => {
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error(`Failed to remove items with prefix: ${prefix}`, error);
    }
  },

  /**
   * Get all keys in localStorage
   */
  keys: (): string[] => {
    if (!isLocalStorageAvailable()) {
      return [];
    }

    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.error('Failed to get keys', error);
    }
    return keys;
  },

  /**
   * Check if a key exists
   */
  hasKey: (key: string): boolean => {
    if (!isLocalStorageAvailable()) {
      return false;
    }

    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  /**
   * Get storage info
   */
  getInfo: () => {
    return {
      available: isLocalStorageAvailable(),
      size: getStorageSize(),
      sizeFormatted: getStorageSizeFormatted(),
      itemCount: isLocalStorageAvailable() ? localStorage.length : 0,
    };
  },
};

/**
 * Type-safe token storage helpers
 */
export const tokenStorage = {
  setToken: (key: string, token: string, encrypt: boolean = true): void => {
    storage.setItem(key, token, { encrypt });
  },

  getToken: (key: string, encrypt: boolean = true): string | null => {
    return storage.getItem<string>(key, { encrypt });
  },

  removeToken: (key: string): void => {
    storage.removeItem(key);
  },

  clearAllTokens: (): void => {
    // Remove all auth-related tokens
    const authKeys = ['github_token', 'access_token', 'refresh_token', 'authToken', 'mcp_session_token'];
    authKeys.forEach((key) => storage.removeItem(key));
  },
};

/**
 * Cache management helpers
 */
export const cacheStorage = {
  /**
   * Set cache with automatic TTL (default 1 hour)
   */
  setCache: <T>(key: string, data: T, ttlMs: number = 60 * 60 * 1000): void => {
    storage.setItem(key, data, { ttl: ttlMs });
  },

  /**
   * Get cache data
   */
  getCache: <T>(key: string): T | null => {
    return storage.getItem<T>(key);
  },

  /**
   * Remove cache
   */
  removeCache: (key: string): void => {
    storage.removeItem(key);
  },

  /**
   * Clear all cache (removes items with 'cached' prefix)
   */
  clearAllCache: (): void => {
    storage.removeByPrefix('cached');
  },

  /**
   * Clear repository-specific cache
   */
  clearRepoCache: (repoKey: string): void => {
    storage.removeByPrefix(`cachedAnalysisResult_${repoKey}`);
    storage.removeByPrefix(`cachedConversionPlanner_${repoKey}`);
    storage.removeByPrefix(`cachedTransformationData_${repoKey}`);
  },
};
