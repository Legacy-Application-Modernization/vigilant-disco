import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { auth } from '../config/firebase';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Debug environment variables
    
    console.log('🔍 Environment Debug:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('All env vars:', import.meta.env);
    
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    console.log('📡 API Service Base URL:', this.baseURL);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Debug axios configuration
    console.log('⚙️ Axios instance config:', this.api.defaults);

    // Add request interceptor
    // In your API service constructor
this.api.interceptors.request.use(
  async (config) => {
    
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request');
      } catch (error) {
        console.error('❌ Error getting auth token:', error);
      }
    } else {
      console.log('⚠️ No authenticated user found');
    }
    return config;
  }
);
    this.api.interceptors.request.use(
      async (config) => {
        console.log('🚀 Making request to:', (config.baseURL ?? '') + config.url);
        
        const user = auth.currentUser;
        if (user) {
          try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error('Error getting auth token:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
      
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('❌ API Request failed:', error);
        if (error.response?.status === 401) {
          console.log('Unauthorized access - user may need to log in again');
        }
        return Promise.reject(error);
      }
    );
  }

  // Rest of your methods...
  private async request<T>(method: string, url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.api.request({
      method,
      url,
      data,
    });
    return response.data;
  }

  // All your API methods remain the same...
  async healthCheck(): Promise<any> {
    return this.request('GET', '/health');
  }

  async getUserProfile(): Promise<any> {
    return this.request('GET', '/api/v1/users/profile');
  }

  async updateUserProfile(userData: any): Promise<any> {
    return this.request('PUT', '/api/v1/users/profile', userData);
  }

  async initializeUser(): Promise<any> {
    return this.request('POST', '/api/v1/users/initialize');
  }

  async getUserStats(): Promise<any> {
    return this.request('GET', '/api/v1/users/stats');
  }

  async createProject(projectData: any): Promise<any> {
    return this.request('POST', '/api/v1/projects', projectData);
  }

  async getUserProjects(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request('GET', `/api/v1/projects${queryString}`);
  }

  async getProject(projectId: string): Promise<any> {
    return this.request('GET', `/api/v1/projects/${projectId}`);
  }

  async updateProject(projectId: string, updateData: any): Promise<any> {
    return this.request('PUT', `/api/v1/projects/${projectId}`, updateData);
  }

  async deleteProject(projectId: string): Promise<any> {
    return this.request('DELETE', `/api/v1/projects/${projectId}`);
  }

  async updateProjectStatus(projectId: string, status: string): Promise<any> {
    return this.request('PUT', `/api/v1/projects/${projectId}/status`, { status });
  }

  async addProjectNote(projectId: string, note: string): Promise<any> {
    return this.request('POST', `/api/v1/projects/${projectId}/notes`, { note });
  }

  async getProjectsByTag(tag: string): Promise<any> {
    return this.request('GET', `/api/v1/projects/by-tag/${tag}`);
  }
}

export default new ApiService();