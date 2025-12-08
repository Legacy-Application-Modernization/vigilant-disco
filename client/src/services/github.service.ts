import axios from 'axios';
import { cacheManager, CACHE_EXPIRATION } from '../utils/cacheManager';
import { CACHE_KEYS } from '../utils/cacheManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  updated_at: string;
  language: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  size: number;
  content?: string;
}

class GitHubService {
  // Note: GitHub tokens are now handled via HTTP-only cookies on the server
  // The client no longer stores or manages tokens directly

  async getAuthUrl(): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/github/auth`, {
      withCredentials: true, // Include cookies
    });
    return response.data.authUrl;
  }

  async handleCallback(code: string): Promise<{ accessToken: string; user: any }> {
    const response = await axios.post(
      `${API_BASE_URL}/github/callback`, 
      { code },
      { withCredentials: true } // Server will set HTTP-only cookie
    );
    const { accessToken, user } = response.data;
    return { accessToken, user };
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    const response = await axios.get(`${API_BASE_URL}/github/repos`, {
      withCredentials: true, // Send auth cookie
    });
    return response.data.repositories;
  }

  async getRepoContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    const response = await axios.get(
      `${API_BASE_URL}/github/repos/${owner}/${repo}/contents`,
      {
        withCredentials: true,
        params: { path },
      }
    );
    return response.data.contents;
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<GitHubFile> {
    const response = await axios.get(
      `${API_BASE_URL}/github/repos/${owner}/${repo}/file`,
      {
        withCredentials: true,
        params: { path },
      }
    );
    return response.data.file;
  }

  async searchPhpFiles(owner: string, repo: string, maxDepth: number = 5): Promise<GitHubFile[]> {
    const response = await axios.post(
      `${API_BASE_URL}/github/repos/${owner}/${repo}/search-php`,
      { maxDepth },
      {
        withCredentials: true,
      }
    );
    return response.data.files;
  }

  // Store selected repository in IndexedDB (not sensitive data)
  async saveSelectedRepository(repo: GitHubRepository): Promise<void> {
    await cacheManager.set(CACHE_KEYS.SELECTED_REPOSITORY, repo, CACHE_EXPIRATION.ONE_DAY);
  }

  async getSelectedRepository(): Promise<GitHubRepository | null> {
    return await cacheManager.get<GitHubRepository>(CACHE_KEYS.SELECTED_REPOSITORY);
  }

  async clearSelectedRepository(): Promise<void> {
    await cacheManager.remove(CACHE_KEYS.SELECTED_REPOSITORY);
  }
}

export default new GitHubService();
