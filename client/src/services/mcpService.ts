// src/services/mcpService.ts

/**
 * MCP (Model Control Protocol) Service
 * Handles communication with the MCP server for code analysis and transformation
 */

// Configuration
const MCP_API_URL = import.meta.env.VITE_MCP_API_URL || 'https://api.your-mcp-server.com';
const MCP_API_KEY = import.meta.env.VITE_MCP_API_KEY;

// Types
export interface MCPOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface MCPResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class MCPService {
  private apiUrl: string;
  private readonly _apiKey: string | undefined;
  private defaultOptions: MCPOptions;
  private isConnected: boolean = false;
  private sessionToken: string | null = null;
  
  // Helper to check if API key is configured
  private hasApiKey(): boolean {
    return !!this._apiKey;
  }

  constructor(apiUrl: string, apiKey?: string, options: MCPOptions = {}) {
    this.apiUrl = apiUrl;
    this._apiKey = apiKey;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
      timeout: 60000,
      ...options,
    };

    // Try to restore session from localStorage
    this.restoreSession();
  }

  /**
   * Restore session from localStorage if available
   */
  private restoreSession(): void {
    try {
      const token = localStorage.getItem('mcp_session_token');
      if (token) {
        this.sessionToken = token;
        this.isConnected = true;
        
        // Add the token to default headers
        if (this.defaultOptions.headers) {
          this.defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Failed to restore MCP session:', error);
    }
  }

  /**
   * Connect to the MCP server
   */
  async connect(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      const response = await this.request<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data?.token) {
        this.sessionToken = response.data.token;
        this.isConnected = true;
        
        // Add the token to default headers
        if (this.defaultOptions.headers) {
          this.defaultOptions.headers['Authorization'] = `Bearer ${this.sessionToken}`;
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('mcp_session_token', this.sessionToken);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('MCP connection error:', error);
      return false;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  disconnect(): void {
    this.sessionToken = null;
    this.isConnected = false;
    
    // Remove the token from headers
    if (this.defaultOptions.headers) {
      delete this.defaultOptions.headers['Authorization'];
    }
    
    // Clear from localStorage
    localStorage.removeItem('mcp_session_token');
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): { isConnected: boolean; sessionToken: string | null } {
    return {
      isConnected: this.isConnected,
      sessionToken: this.sessionToken,
    };
  }

  /**
   * Make a request to the MCP server
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<MCPResponse<T>> {
    const url = `${this.apiUrl}${endpoint}`;
    
    // Merge default headers with request-specific headers
    const headers = {
      ...this.defaultOptions.headers,
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultOptions.timeout);
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || `HTTP_${response.status}`,
            message: data.message || 'An unknown error occurred',
          },
        };
      }
      
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error(`MCP API error (${endpoint}):`, error);
      
      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Request failed',
        },
      };
    }
  }

  /**
   * Upload PHP files for analysis
   */
  async uploadFiles(files: File[]): Promise<MCPResponse<{ projectId: string; fileCount: number }>> {
    if (!this.isConnected) {
      return {
        success: false,
        error: {
          code: 'NOT_CONNECTED',
          message: 'Not connected to MCP server',
        },
      };
    }
    
    // Log API key status for debugging
    console.debug('API key configured:', this.hasApiKey());

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      const response = await fetch(`${this.apiUrl}/projects/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sessionToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || `HTTP_${response.status}`,
            message: data.message || 'Failed to upload files',
          },
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('File upload error:', error);
      
      return {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : 'File upload failed',
        },
      };
    }
  }

  /**
   * Analyze uploaded PHP project
   */
  async analyzeProject(projectId: string): Promise<MCPResponse<unknown>> {
    return this.request(`/projects/${projectId}/analyze`, {
      method: 'POST',
    });
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(projectId: string): Promise<MCPResponse<unknown>> {
    return this.request(`/projects/${projectId}/analysis`);
  }

  /**
   * Transform PHP code to Node.js
   */
  async transformCode(
    projectId: string,
    options: {
      useAsync?: boolean;
      convertToTypeScript?: boolean;
      includeValidation?: boolean;
      addErrorHandling?: boolean;
      includeDocker?: boolean;
      generateUnitTests?: boolean;
    }
  ): Promise<MCPResponse<unknown>> {
    return this.request(`/projects/${projectId}/transform`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Get transformation results
   */
  async getTransformationResults(projectId: string): Promise<MCPResponse<unknown>> {
    return this.request(`/projects/${projectId}/transformation`);
  }

  /**
   * Improve transformed code
   */
  async improveCode(
    projectId: string,
    fileId: string,
    originalCode: string,
    currentCode: string,
    options: {
      improvementType: 'performance' | 'readability' | 'bestPractices' | 'errorHandling' | 'typescript';
      customInstructions?: string;
    }
  ): Promise<MCPResponse<{ improvedCode: string }>> {
    return this.request(`/projects/${projectId}/files/${fileId}/improve`, {
      method: 'POST',
      body: JSON.stringify({
        originalCode,
        currentCode,
        options,
      }),
    });
  }

  /**
   * Export project
   */
  async exportProject(
    projectId: string,
    format: 'zip' | 'github' | 'docker' | 'cloud',
    options?: Record<string, unknown>
  ): Promise<MCPResponse<{ downloadUrl?: string; repositoryUrl?: string }>> {
    return this.request(`/projects/${projectId}/export`, {
      method: 'POST',
      body: JSON.stringify({
        format,
        ...options,
      }),
    });
  }

  /**
   * Generic method to call any MCP endpoint
   */
  async callEndpoint<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<MCPResponse<T>> {
    return this.request<T>(endpoint, options);
  }
}

// Create and export instance
export const mcpService = new MCPService(
  MCP_API_URL,
  MCP_API_KEY
);

export default mcpService;