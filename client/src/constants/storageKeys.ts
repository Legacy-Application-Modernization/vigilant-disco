/**
 * Centralized storage keys for localStorage
 * This ensures consistency across the application and prevents typos
 */

export const STORAGE_KEYS = {
  // Authentication tokens
  AUTH: {
    GITHUB_TOKEN: 'github_token',
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    AUTH_TOKEN: 'authToken', // Legacy - consider deprecating
    MCP_SESSION_TOKEN: 'mcp_session_token',
  },

  // OAuth flow
  OAUTH: {
    GITHUB_CODE: 'github_oauth_code',
  },

  // Repository data
  REPOSITORY: {
    SELECTED: 'selectedRepository',
  },

  // Cache keys
  CACHE: {
    ANALYSIS_RESULT: 'cachedAnalysisResult',
    CONVERSION_PLANNER: 'cachedConversionPlanner',
    TRANSFORMATION_DATA: 'cachedTransformationData',
    // Repository-specific cache keys use a function to generate the key
    getAnalysisKey: (repoKey: string) => `cachedAnalysisResult_${repoKey}`,
    getConversionPlannerKey: (repoKey: string) => `cachedConversionPlanner_${repoKey}`,
    getTransformationKey: (repoKey: string) => `cachedTransformationData_${repoKey}`,
  },
} as const;

/**
 * Helper to generate repository-specific cache key
 */
export const getRepoKey = (owner: string, repo: string): string => {
  return `${owner}_${repo}`;
};

/**
 * Storage key prefixes for bulk operations
 */
export const STORAGE_PREFIXES = {
  CACHE_ANALYSIS: 'cachedAnalysisResult_',
  CACHE_CONVERSION: 'cachedConversionPlanner_',
  CACHE_TRANSFORMATION: 'cachedTransformationData_',
} as const;
