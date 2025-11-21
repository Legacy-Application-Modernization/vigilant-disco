import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface CacheDB extends DBSchema {
  cache: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresIn?: number; // milliseconds
    };
  };
}

class CacheManager {
  private dbPromise: Promise<IDBPDatabase<CacheDB>>;
  private readonly DB_NAME = 'AppCacheDB';
  private readonly STORE_NAME = 'cache';
  private readonly DB_VERSION = 1;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase<CacheDB>> {
    return openDB<CacheDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      },
    });
  }

  /**
   * Store data in IndexedDB cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param expiresIn - Expiration time in milliseconds (optional)
   */
  async set(key: string, data: any, expiresIn?: number): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.put(this.STORE_NAME, {
        data,
        timestamp: Date.now(),
        expiresIn,
      }, key);
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve data from IndexedDB cache
   * @param key - Cache key
   * @returns Cached data or null if not found or expired
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.dbPromise;
      const entry = await db.get(this.STORE_NAME, key);

      if (!entry) {
        return null;
      }

      // Check if expired
      if (entry.expiresIn) {
        const now = Date.now();
        if (now - entry.timestamp > entry.expiresIn) {
          // Data expired, remove it
          await this.remove(key);
          return null;
        }
      }

      return entry.data as T;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data from cache
   * @param key - Cache key
   */
  async remove(key: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.delete(this.STORE_NAME, key);
    } catch (error) {
      console.error(`Error removing cache for key ${key}:`, error);
    }
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.clear(this.STORE_NAME);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get all cache keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.dbPromise;
      return (await db.getAllKeys(this.STORE_NAME)) as string[];
    } catch (error) {
      console.error('Error getting all cache keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    try {
      const db = await this.dbPromise;
      const keys = await db.getAllKeys(this.STORE_NAME);
      const now = Date.now();

      for (const key of keys) {
        const entry = await db.get(this.STORE_NAME, key);
        if (entry?.expiresIn && now - entry.timestamp > entry.expiresIn) {
          await db.delete(this.STORE_NAME, key);
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Cache key constants
export const CACHE_KEYS = {
  ANALYSIS_RESULT: 'cachedAnalysisResult',
  CONVERSION_PLANNER: 'cachedConversionPlanner',
  TRANSFORMATION_DATA: 'cachedTransformationData',
  SELECTED_REPOSITORY: 'selectedRepository',
  MCP_SESSION: 'mcp_session_token',
  USER_PREFERENCES: 'userPreferences',
} as const;

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  SESSION: undefined, // No expiration for session data
} as const;
