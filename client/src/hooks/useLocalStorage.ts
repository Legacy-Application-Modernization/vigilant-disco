import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { storage, StorageOptions } from '../utils/localStorage';

/**
 * Custom hook for managing localStorage with React state
 *
 * Features:
 * - Automatic state synchronization with localStorage
 * - Type-safe with TypeScript generics
 * - Error handling built-in
 * - Optional TTL (time-to-live) for cache expiration
 * - Optional encryption for sensitive data
 * - SSR-safe (won't crash on server-side rendering)
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @param options - Optional configuration (ttl, encrypt)
 *
 * @returns [storedValue, setValue, removeValue]
 *
 * @example
 * const [user, setUser, removeUser] = useLocalStorage('user', null);
 *
 * @example
 * // With TTL (1 hour)
 * const [cache, setCache] = useLocalStorage('cache', null, { ttl: 60 * 60 * 1000 });
 *
 * @example
 * // With encryption
 * const [token, setToken] = useLocalStorage('token', '', { encrypt: true });
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: StorageOptions
): [T, Dispatch<SetStateAction<T>>, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from localStorage by key
      const item = storage.getItem<T>(key, { encrypt: options?.encrypt });
      // Return stored value or initial value if not found
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        storage.setItem(key, valueToStore, options);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, options]
  );

  // Remove value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen to changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = storage.getItem<T>(key, { encrypt: options?.encrypt });
          if (newValue !== null) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, options?.encrypt]);

  return [storedValue, setValue, removeValue];
}

/**
 * Specialized hook for session storage (same API as useLocalStorage)
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing cached data with automatic expiration
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60 * 60 * 1000 // Default 1 hour
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
} {
  const [data, setData] = useState<T | null>(() => {
    return storage.getItem<T>(key);
  });
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
      storage.setItem(key, result, { ttl: ttlMs });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`Error fetching data for key "${key}":`, error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttlMs]);

  const clearCache = useCallback(() => {
    storage.removeItem(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    // Only fetch if we don't have cached data
    if (!data) {
      fetchData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    clearCache,
  };
}

export default useLocalStorage;
