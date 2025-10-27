import axios from 'axios';

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
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('github_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('github_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('github_token');
  }

  async getAuthUrl(): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/github/auth`);
    return response.data.authUrl;
  }

  async handleCallback(code: string): Promise<{ accessToken: string; user: any }> {
    const response = await axios.post(`${API_BASE_URL}/github/callback`, { code });
    const { accessToken, user } = response.data;
    this.setToken(accessToken);
    return { accessToken, user };
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    const token = this.getToken();
    if (!token) throw new Error('No GitHub token available');

    const response = await axios.get(`${API_BASE_URL}/github/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.repositories;
  }

  async getRepoContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    const token = this.getToken();
    if (!token) throw new Error('No GitHub token available');

    const response = await axios.get(
      `${API_BASE_URL}/github/repos/${owner}/${repo}/contents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { path },
      }
    );
    return response.data.contents;
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<GitHubFile> {
    const token = this.getToken();
    if (!token) throw new Error('No GitHub token available');

    const response = await axios.get(
      `${API_BASE_URL}/github/repos/${owner}/${repo}/file`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { path },
      }
    );
    return response.data.file;
  }

  async searchPhpFiles(owner: string, repo: string, maxDepth: number = 5): Promise<GitHubFile[]> {
    const token = this.getToken();
    if (!token) throw new Error('No GitHub token available');

    const response = await axios.post(
      `${API_BASE_URL}/github/repos/${owner}/${repo}/search-php`,
      { maxDepth },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.files;
  }
}

export default new GitHubService();
