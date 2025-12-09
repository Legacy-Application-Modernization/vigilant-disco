/**
 * Migration utility to help transition from localStorage to IndexedDB
 * This helps maintain backward compatibility during the transition period
 */

import { cacheManager, CACHE_KEYS } from './cacheManager';

/**
 * Migrate data from localStorage to IndexedDB
 * Run this once on app startup to migrate existing user data
 */
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    const migrations = [
      {
        localStorageKey: 'cachedAnalysisResult',
        indexedDBKey: CACHE_KEYS.ANALYSIS_RESULT,
      },
      {
        localStorageKey: 'cachedConversionPlanner',
        indexedDBKey: CACHE_KEYS.CONVERSION_PLANNER,
      },
      {
        localStorageKey: 'cachedTransformationData',
        indexedDBKey: CACHE_KEYS.TRANSFORMATION_DATA,
      },
      {
        localStorageKey: 'selectedRepository',
        indexedDBKey: CACHE_KEYS.SELECTED_REPOSITORY,
      },
    ];

    for (const { localStorageKey, indexedDBKey } of migrations) {
      const data = localStorage.getItem(localStorageKey);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          await cacheManager.set(indexedDBKey, parsedData);
          // Clean up old localStorage entry
          localStorage.removeItem(localStorageKey);
          console.log(`✅ Migrated ${localStorageKey} to IndexedDB`);
        } catch (error) {
          console.error(`Failed to migrate ${localStorageKey}:`, error);
        }
      }
    }

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

/**
 * Clear only cached data while preserving auth tokens and notifications
 * This will force a fresh fetch from the server for all cached data
 * Note: This also clears workflow state (selectedRepository, currentProjectId) for a complete fresh start
 */
export async function clearCacheKeepAuthAndNotifications(): Promise<void> {
  // Clear all IndexedDB cache (analysis results, conversion data, etc.)
  await cacheManager.clear();

  // Define keys to preserve
  const keysToKeep = [
    // Auth-related
    'access_token',
    'refresh_token',
    'authToken',
    'github_token',
    'github_oauth_code',
    'mcp_session_token',

    // Notifications
    'phase_notifications',

    // UI preferences (Zustand store)
    'ui-preferences',
  ];

  // Get all localStorage keys and filter based on patterns
  const allKeys = Object.keys(localStorage);

  for (const key of allKeys) {
    // Keep if key is in the preserve list
    if (keysToKeep.includes(key)) {
      continue;
    }

    // Keep if key starts with Firebase auth prefix
    if (key.startsWith('firebase:')) {
      continue;
    }

    // Remove everything else (cached data, old tokens, etc.)
    localStorage.removeItem(key);
    console.log(`🧹 Cleared cache: ${key}`);
  }

  console.log('✅ Cache cleared. Auth tokens and notifications preserved.');
}
