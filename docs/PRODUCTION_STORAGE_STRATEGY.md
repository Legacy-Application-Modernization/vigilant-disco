# Production-Ready Storage Strategy for React App

## Current localStorage Usage Analysis

Your app currently uses `localStorage` for:

### 1. **Authentication & Tokens** 🔐
- `github_token` - GitHub OAuth token
- `github_oauth_code` - Temporary OAuth code
- `access_token` - API access token
- `refresh_token` - Token refresh
- `authToken` - General auth token
- `mcp_session_token` - MCP session token

### 2. **Cached Data** 💾
- `cachedAnalysisResult` - Code analysis results
- `cachedConversionPlanner` - Conversion planning data
- `cachedTransformationData` - Transformation data
- `selectedRepository` - Repository selection state

## Problems with Current Approach

### Security Issues 🚨
1. **Tokens in localStorage are vulnerable to XSS attacks**
   - Any JavaScript can access `localStorage`
   - Not safe for sensitive tokens
   - GitHub tokens could be stolen

2. **No Encryption**
   - Data stored in plain text
   - Visible in browser DevTools

3. **No Expiration**
   - Tokens never expire automatically
   - Stale data persists indefinitely

### Performance Issues 📊
1. **Size Limitations**
   - localStorage limited to ~5-10MB
   - Large cached data can hit limits
   - No compression

2. **Synchronous Operations**
   - Blocks main thread
   - Can cause UI lag with large data

3. **No Structured Queries**
   - Can't efficiently search or filter
   - Must load entire data to access parts

## Recommended Production Solutions

### Solution 1: Secure Token Management (Highest Priority)

#### Use HTTP-Only Cookies for Auth Tokens

**Why:**
- Not accessible via JavaScript (XSS protection)
- Automatically sent with requests
- Can set expiration and secure flags

**Implementation:**

\`\`\`typescript
// client/src/utils/storage.ts
export class SecureStorage {
  // Don't store sensitive tokens in localStorage
  // Let the server set HTTP-only cookies instead
  
  static getAuthToken(): string | null {
    // Token comes from HTTP-only cookie automatically
    // No need to manually access it
    return null; // Server handles this
  }
}
\`\`\`

**Server-Side Changes:**

\`\`\`typescript
// server/src/middleware/auth.ts
import { Response } from 'express';

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('auth_token', token, {
    httpOnly: true,      // Not accessible via JavaScript
    secure: true,        // Only sent over HTTPS
    sameSite: 'strict',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

export const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/v1/auth/refresh'  // Limited path
  });
};
\`\`\`

### Solution 2: IndexedDB for Large Cached Data

**Why:**
- Much larger storage (gigabytes)
- Asynchronous operations
- Structured storage with indexes
- Better performance

**Implementation:**

\`\`\`typescript
// client/src/utils/indexedDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CacheDB extends DBSchema {
  'analysis-cache': {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
  'repository-data': {
    key: string;
    value: {
      id: string;
      repository: any;
      timestamp: number;
    };
    indexes: { 'by-date': number };
  };
}

class CacheManager {
  private db: IDBPDatabase<CacheDB> | null = null;

  async init() {
    this.db = await openDB<CacheDB>('app-cache', 1, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('analysis-cache')) {
          db.createObjectStore('analysis-cache', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('repository-data')) {
          const store = db.createObjectStore('repository-data', { keyPath: 'id' });
          store.createIndex('by-date', 'timestamp');
        }
      },
    });
  }

  async setCache(key: string, data: any, ttlMinutes: number = 60) {
    if (!this.db) await this.init();
    
    await this.db!.put('analysis-cache', {
      id: key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    });
  }

  async getCache(key: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    const cached = await this.db!.get('analysis-cache', key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      await this.db!.delete('analysis-cache', key);
      return null;
    }
    
    return cached.data;
  }

  async clearExpired() {
    if (!this.db) await this.init();
    
    const allKeys = await this.db!.getAllKeys('analysis-cache');
    const now = Date.now();
    
    for (const key of allKeys) {
      const item = await this.db!.get('analysis-cache', key);
      if (item && now > item.expiresAt) {
        await this.db!.delete('analysis-cache', key);
      }
    }
  }

  async clearAll() {
    if (!this.db) await this.init();
    await this.db!.clear('analysis-cache');
    await this.db!.clear('repository-data');
  }
}

export const cacheManager = new CacheManager();
\`\`\`

### Solution 3: Zustand + Persist for State Management

**Why:**
- Better than raw localStorage
- Automatic hydration
- Type-safe
- Selective persistence
- Middleware support

**Implementation:**

\`\`\`typescript
// client/src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  githubToken: string | null;
  setGithubToken: (token: string | null) => void;
  clearAuth: () => void;
}

// ONLY for non-sensitive data like UI preferences
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      githubToken: null, // Consider moving to secure cookie
      setGithubToken: (token) => set({ githubToken: token }),
      clearAuth: () => set({ githubToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage
      partialize: (state) => ({
        // Only persist non-sensitive data
        // githubToken should NOT be persisted
      }),
    }
  )
);
\`\`\`

\`\`\`typescript
// client/src/store/cacheStore.ts
import { create } from 'zustand';

interface CacheState {
  analysisCache: Map<string, { data: any; timestamp: number }>;
  setAnalysisCache: (key: string, data: any) => void;
  getAnalysisCache: (key: string, maxAge?: number) => any | null;
  clearAnalysisCache: () => void;
}

export const useCacheStore = create<CacheState>((set, get) => ({
  analysisCache: new Map(),
  
  setAnalysisCache: (key, data) => {
    set((state) => {
      const newCache = new Map(state.analysisCache);
      newCache.set(key, { data, timestamp: Date.now() });
      return { analysisCache: newCache };
    });
  },
  
  getAnalysisCache: (key, maxAge = 3600000) => {
    const cache = get().analysisCache.get(key);
    if (!cache) return null;
    
    if (Date.now() - cache.timestamp > maxAge) {
      get().analysisCache.delete(key);
      return null;
    }
    
    return cache.data;
  },
  
  clearAnalysisCache: () => set({ analysisCache: new Map() }),
}));
\`\`\`

### Solution 4: React Query for Server State

**Why:**
- Automatic caching
- Background refetching
- Stale-while-revalidate
- Request deduplication
- Optimistic updates

**Implementation:**

\`\`\`typescript
// client/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
\`\`\`

\`\`\`typescript
// client/src/hooks/useAnalysis.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

export function useAnalysisData(repositoryId: string) {
  return useQuery({
    queryKey: ['analysis', repositoryId],
    queryFn: () => apiService.getAnalysis(repositoryId),
    enabled: !!repositoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createAnalysis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
    },
  });
}
\`\`\`

## Migration Plan

### Phase 1: Move Sensitive Tokens (Week 1) 🔴 Critical

1. **Update Backend**
   \`\`\`bash
   # Add cookie-parser
   cd server && npm install cookie-parser @types/cookie-parser
   \`\`\`

2. **Implement HTTP-only cookies**
   - GitHub token → HTTP-only cookie
   - Access token → HTTP-only cookie
   - Refresh token → HTTP-only cookie

3. **Remove from localStorage**
   - Update `github.service.ts`
   - Update `config/api.ts`

### Phase 2: Implement IndexedDB (Week 2) 🟡 High Priority

1. **Install idb library**
   \`\`\`bash
   cd client && npm install idb
   \`\`\`

2. **Create cache manager**
   - Migrate analysis cache
   - Migrate repository data
   - Migrate transformation data

3. **Add cleanup jobs**
   - Clear expired cache on app start
   - Periodic cleanup every hour

### Phase 3: Add React Query (Week 3) 🟢 Recommended

1. **Install dependencies**
   \`\`\`bash
   npm install @tanstack/react-query @tanstack/react-query-devtools
   \`\`\`

2. **Wrap app with provider**

3. **Convert API calls to queries**
   - Project limits
   - User profile
   - Analysis data

### Phase 4: State Management (Week 4) 🔵 Enhancement

1. **Already using Zustand** ✓
2. **Add persist middleware for non-sensitive UI state**
3. **Remove unnecessary localStorage calls**

## Comparison Table

| Feature | localStorage | HTTP-Only Cookies | IndexedDB | React Query |
|---------|--------------|-------------------|-----------|-------------|
| **Security** | ⚠️ Low (XSS vulnerable) | ✅ High | ⚠️ Low (XSS vulnerable) | ✅ High |
| **Size Limit** | ~5-10MB | ~4KB | ~Unlimited | In-memory |
| **Performance** | ⚠️ Synchronous | ✅ Auto-sent | ✅ Async | ✅ Optimized |
| **Best For** | UI preferences | Auth tokens | Large data cache | Server state |
| **Auto Expiry** | ❌ No | ✅ Yes | ⚠️ Manual | ✅ Yes |
| **Server Access** | ❌ No | ✅ Yes | ❌ No | ❌ No |

## Implementation Priority

### 🔴 **CRITICAL - Do First**
1. Move `github_token` to HTTP-only cookie
2. Move `access_token` to HTTP-only cookie
3. Move `refresh_token` to HTTP-only cookie

### 🟡 **HIGH - Do Soon**
4. Implement IndexedDB for cached analysis data
5. Remove `cachedAnalysisResult` from localStorage
6. Remove `cachedConversionPlanner` from localStorage
7. Remove `cachedTransformationData` from localStorage

### 🟢 **MEDIUM - Improve**
8. Add React Query for API calls
9. Implement automatic cache invalidation
10. Add cache size management

### 🔵 **LOW - Nice to Have**
11. Add Zustand persist for UI preferences only
12. Add analytics for cache hit rates
13. Implement cache warming strategies

## Code Examples

### Quick Win: Encrypt Sensitive Data

If you can't immediately move to cookies, at least encrypt:

\`\`\`typescript
// client/src/utils/secureStorage.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET || 'fallback-key';

export class SecureLocalStorage {
  static set(key: string, value: any): void {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      SECRET_KEY
    ).toString();
    localStorage.setItem(key, encrypted);
  }

  static get(key: string): any {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}
\`\`\`

## Testing Considerations

\`\`\`typescript
// Mock IndexedDB in tests
import 'fake-indexeddb/auto';

// Mock React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});
\`\`\`

## Monitoring & Analytics

\`\`\`typescript
// Track storage usage
const getStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return (total / 1024).toFixed(2) + ' KB';
};

console.log('localStorage usage:', getStorageSize());
\`\`\`

## Resources

- [OWASP: HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [React Query Documentation](https://tanstack.com/query/latest)
- [idb Library](https://github.com/jakearchibald/idb)

---

**TL;DR for Production:**
1. ✅ Use HTTP-only cookies for ALL tokens (most important)
2. ✅ Use IndexedDB for large cached data
3. ✅ Use React Query for server state management
4. ✅ Only use localStorage for non-sensitive UI preferences
5. ❌ NEVER store tokens in localStorage
