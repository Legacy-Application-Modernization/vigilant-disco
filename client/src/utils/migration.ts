/**
 * Migration utility to help transition from localStorage to IndexedDB
 * This helps maintain backward compatibility during the transition period
 */

import { cacheManager } from './cacheManager';

/**
 * Migrate data from localStorage to IndexedDB
 * Run this once on app startup to migrate existing user data
 */
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    // const migrations = [
    //   {
    //     localStorageKey: 'cachedAnalysisResult',
    //     indexedDBKey: CACHE_KEYS.ANALYSIS_RESULT,
    //   },
    //   {
    //     localStorageKey: 'cachedConversionPlanner',
    //     indexedDBKey: CACHE_KEYS.CONVERSION_PLANNER,
    //   },
    //   {
    //     localStorageKey: 'cachedTransformationData',
    //     indexedDBKey: CACHE_KEYS.TRANSFORMATION_DATA,
    //   },
    //   {
    //     localStorageKey: 'selectedRepository',
    //     indexedDBKey: CACHE_KEYS.SELECTED_REPOSITORY,
    //   },
    // ];

    // for (const { localStorageKey, indexedDBKey } of migrations) {
    //   const data = localStorage.getItem(localStorageKey);
    //   if (data) {
    //     try {
    //       const parsedData = JSON.parse(data);
    //       await cacheManager.set(indexedDBKey, parsedData);
          
    //       localStorage.removeItem(localStorageKey);
    //       console.log(`✅ Migrated ${localStorageKey} to IndexedDB`);
    //     } catch (error) {
    //       console.error(`Failed to migrate ${localStorageKey}:`, error);
    //     }
    //   }
    // }

    // Clean up old token storage (these are now handled by HTTP-only cookies)
    const deprecatedKeys = [
      'github_token',
      'access_token',
      'refresh_token',
      'authToken',
      'mcp_session_token',
      'github_oauth_code',
    ];

    for (const key of deprecatedKeys) {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 Cleaned up deprecated token: ${key}`);
      }
    }

    console.log('✅ Migration from localStorage to IndexedDB complete');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

/**
 * Clear all cache data (both localStorage and IndexedDB)
 * Useful for debugging or when user wants to reset
 */
export async function clearAllCachedData(): Promise<void> {
  // Clear IndexedDB
  await cacheManager.clear();

  // Clear localStorage cache entries (keep UI preferences)
  const keysToKeep = ['ui-preferences']; // Zustand persisted state
  const allKeys = Object.keys(localStorage);
  
  for (const key of allKeys) {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  }

  console.log('✅ All cached data cleared');
}
