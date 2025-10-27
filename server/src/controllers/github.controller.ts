import { Request, Response } from 'express';
import axios from 'axios';import dotenv from 'dotenv';
dotenv.config();
// GitHub API Response Types
interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  language: string | null;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
  html_url: string;
  clone_url: string;
  default_branch: string;
}

interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size?: number;
  download_url?: string | null;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  content?: string;
  encoding?: string;
}

// Type guard for Axios errors
interface AxiosErrorType {
  isAxiosError: boolean;
  response?: {
    status: number;
    data?: any;
  };
  message: string;
}

const isAxiosError = (error: unknown): error is AxiosErrorType => {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
};

// Utility function to get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

class GitHubController {
  /**
   * Get GitHub OAuth authorization URL
   * GET /api/v1/github/auth
   */
  public async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const callbackUrl = process.env.GITHUB_CALLBACK_URL;
      
      if (!clientId) {
        res.status(500).json({
          success: false,
          message: 'GitHub OAuth is not configured',
          error: 'GITHUB_CONFIG_MISSING'
        });
        return;
      }

      const scope = 'repo';
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}`;
      
      res.json({
        success: true,
        authUrl,
        message: 'GitHub authorization URL generated'
      });
    } catch (error: unknown) {
      console.error('GitHub auth URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate GitHub authorization URL',
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Exchange OAuth code for access token
   * POST /api/v1/github/callback
   */
  public async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      
      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Authorization code is required',
          error: 'CODE_MISSING'
        });
        return;
      }

      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        res.status(500).json({
          success: false,
          message: 'GitHub OAuth is not configured',
          error: 'GITHUB_CONFIG_MISSING'
        });
        return;
      }

      // Exchange code for access token
      const tokenResponse = await axios.post<GitHubTokenResponse>(
        'https://github.com/login/oauth/access_token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;
      
      if (!accessToken) {
        res.status(400).json({
          success: false,
          message: 'Failed to obtain access token from GitHub',
          error: 'TOKEN_EXCHANGE_FAILED'
        });
        return;
      }

      // Get user info with proper typing
      const userResponse = await axios.get<GitHubUser>(
        'https://api.github.com/user',
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      res.json({
        success: true,
        accessToken,
        user: {
          id: userResponse.data.id,
          login: userResponse.data.login,
          name: userResponse.data.name,
          avatar_url: userResponse.data.avatar_url,
          email: userResponse.data.email,
        },
        message: 'Successfully authenticated with GitHub'
      });
    } catch (error: unknown) {
      console.error('GitHub callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to authenticate with GitHub',
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Get user's repositories
   * GET /api/v1/github/repos
   */
  public async getRepositories(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'GitHub access token is required',
          error: 'TOKEN_MISSING'
        });
        return;
      }

      const response = await axios.get<GitHubRepository[]>(
        'https://api.github.com/user/repos',
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: {
            per_page: 100,
            sort: 'updated',
            affiliation: 'owner,collaborator',
          },
        }
      );

      const repositories = response.data;
      
      // Filter for PHP repositories or repos without a specified language
      const phpRepos = repositories.filter(
        (repo) => repo.language === 'PHP' || !repo.language
      );

      res.json({
        success: true,
        repositories: phpRepos,
        total: phpRepos.length,
        message: `Found ${phpRepos.length} PHP repositories`
      });
    } catch (error: unknown) {
      console.error('GitHub repos error:', error);
      
      if (isAxiosError(error) && error.response?.status === 401) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired GitHub token',
          error: 'INVALID_TOKEN'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch repositories',
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Get repository contents
   * GET /api/v1/github/repos/:owner/:repo/contents
   */
  public async getRepoContents(req: Request, res: Response): Promise<void> {
    try {
      const { owner, repo } = req.params;
      const { path = '' } = req.query;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'GitHub access token is required',
          error: 'TOKEN_MISSING'
        });
        return;
      }

      if (!owner || !repo) {
        res.status(400).json({
          success: false,
          message: 'Repository owner and name are required',
          error: 'PARAMS_MISSING'
        });
        return;
      }

      const response = await axios.get<GitHubContent[] | GitHubContent>(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const contents: GitHubContent[] = Array.isArray(response.data) 
        ? response.data 
        : [response.data];

      res.json({
        success: true,
        contents,
        path: path || 'root',
        message: `Retrieved contents for ${owner}/${repo}`
      });
    } catch (error: unknown) {
      console.error('GitHub contents error:', error);
      
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          res.status(404).json({
            success: false,
            message: 'Repository or path not found',
            error: 'NOT_FOUND'
          });
          return;
        }
        
        if (error.response?.status === 401) {
          res.status(401).json({
            success: false,
            message: 'Invalid or expired GitHub token',
            error: 'INVALID_TOKEN'
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch repository contents',
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Get file content
   * GET /api/v1/github/repos/:owner/:repo/file
   */
  public async getFileContent(req: Request, res: Response): Promise<void> {
    try {
      const { owner, repo } = req.params;
      const { path } = req.query;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'GitHub access token is required',
          error: 'TOKEN_MISSING'
        });
        return;
      }

      if (!owner || !repo || !path || typeof path !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Repository owner, name, and file path are required',
          error: 'PARAMS_MISSING'
        });
        return;
      }

      // First get file metadata
      const metadataResponse = await axios.get<GitHubContent>(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      // Then get raw content
      const contentResponse = await axios.get<string>(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3.raw',
          },
        }
      );

      res.json({
        success: true,
        file: {
          name: metadataResponse.data.name,
          path: metadataResponse.data.path,
          size: metadataResponse.data.size,
          content: contentResponse.data,
          sha: metadataResponse.data.sha,
        },
        message: `Retrieved file content for ${path}`
      });
    } catch (error: unknown) {
      console.error('GitHub file content error:', error);
      
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          res.status(404).json({
            success: false,
            message: 'File not found',
            error: 'NOT_FOUND'
          });
          return;
        }
        
        if (error.response?.status === 401) {
          res.status(401).json({
            success: false,
            message: 'Invalid or expired GitHub token',
            error: 'INVALID_TOKEN'
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch file content',
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Search for PHP files in a repository recursively
   * POST /api/v1/github/repos/:owner/:repo/search-php
   */
  public async searchPhpFiles(req: Request, res: Response): Promise<void> {
    try {
      const { owner, repo } = req.params;
      const { maxDepth = 5 } = req.body;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'GitHub access token is required',
          error: 'TOKEN_MISSING'
        });
        return;
      }

      const phpFiles: Array<{ name: string; path: string; size: number }> = [];
      
      const explorePath = async (path: string = '', depth: number = 0): Promise<void> => {
        if (depth > maxDepth) return;
        
        try {
          const response = await axios.get<GitHubContent[] | GitHubContent>(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
            {
              headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );

          const contents: GitHubContent[] = Array.isArray(response.data) 
            ? response.data 
            : [response.data];

          for (const item of contents) {
            if (item.type === 'file' && item.name.endsWith('.php')) {
              phpFiles.push({
                name: item.name,
                path: item.path,
                size: item.size || 0,
              });
            } else if (item.type === 'dir') {
              // Skip common directories that typically don't contain source code
              const skipDirs = ['node_modules', 'vendor', 'tests', 'test', '.git', 'storage', 'public'];
              if (!skipDirs.includes(item.name)) {
                await explorePath(item.path, depth + 1);
              }
            }
          }
        } catch (err: unknown) {
          console.error(`Error exploring path ${path}:`, getErrorMessage(err));
        }
      };

      await explorePath();

      res.json({
        success: true,
        files: phpFiles,
        total: phpFiles.length,
        message: `Found ${phpFiles.length} PHP files in ${owner}/${repo}`
      });
    } catch (error: unknown) {
      console.error('GitHub PHP search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search for PHP files',
        error: getErrorMessage(error)
      });
    }
  }
}

export default new GitHubController();