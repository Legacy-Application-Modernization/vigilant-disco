/**
 * Backend Service for FastAPI (Port 8000)
 * Handles repository analysis, migration planning, and code migration
 */

import { backendApi } from '../config/api';
import type { 
  ProjectStatus, 
  ProjectDetailsResponse,
  ProjectsListResponse
} from '../types/project';

export interface AnalyzeRepoRequest {
  user_id: string;
  repo_url: string;
  project_name?: string;
}

export interface AnalyzeRepoResponse {
  success: boolean;
  message: string;
  project_id: string;
  status: ProjectStatus;
  analysis_data?: any;
}

export interface MigrationPlanRequest {
  user_id: string;
  project_id: string;
  repo_url: string;
}

export interface MigrationPlanResponse {
  success: boolean;
  message: string;
  project_id: string;
  status: ProjectStatus;
  migration_plan?: any;
}

export interface MigrateCodeRequest {
  user_id: string;
  project_id: string;
  repo_url: string;
  phase: 1 | 2 | 3;  // Migration phases
}

export interface MigrateCodeResponse {
  success: boolean;
  message: string;
  project_id: string;
  status: ProjectStatus;
  phase: number;
  migration_data?: any;
}

class BackendService {
  /**
   * Helper: Format error message for user display
   */
  private formatError(error: any, defaultMessage: string): Error {
    const userMessage = error.userMessage || error.response?.data?.detail || error.message || defaultMessage;
    const formattedError = new Error(userMessage);
    (formattedError as any).originalError = error;
    return formattedError;
  }

  /**
   * Step 1: Analyze Repository
   * Analyzes the PHP repository structure and dependencies
   */
  async analyzeRepository(request: AnalyzeRepoRequest): Promise<AnalyzeRepoResponse> {
    try {
      const response = await backendApi.post('/analyze-repo', request);
      return response.data;
    } catch (error: any) {
      console.error('Analyze Repository Error:', error.response?.data || error.message);
      throw this.formatError(error, 'Failed to analyze repository. Please try again.');
    }
  }

  /**
   * Step 2: Generate Migration Plan
   * Creates a detailed migration plan for the project
   */
  async generateMigrationPlan(request: MigrationPlanRequest): Promise<MigrationPlanResponse> {
    try {
      const response = await backendApi.post('/migrationplan', request);
      return response.data;
    } catch (error: any) {
      console.error('Migration Plan Error:', error.response?.data || error.message);
      throw this.formatError(error, 'Failed to generate migration plan. Please try again.');
    }
  }

  /**
   * Step 3: Migrate Code
   * Executes code migration in phases
   */
  async migrateCode(request: MigrateCodeRequest): Promise<MigrateCodeResponse> {
    try {
      const response = await backendApi.post('/migrate-code', request);
      return response.data;
    } catch (error: any) {
      console.error('Migrate Code Error:', error.response?.data || error.message);
      throw this.formatError(error, 'Failed to migrate code. Please try again.');
    }
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<ProjectsListResponse> {
    try {
      const response = await backendApi.get(`/projects/user/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get User Projects Error:', error.response?.data || error.message);
      throw this.formatError(error, 'Failed to fetch projects. Please try again.');
    }
  }

  /**
   * Get projects by status for a user
   */
  async getProjectsByStatus(userId: string, status: ProjectStatus): Promise<ProjectsListResponse> {
    try {
      const response = await backendApi.get(`/projects/user/${userId}/status/${status}`);
      return response.data;
    } catch (error: any) {
      console.error('Get Projects By Status Error:', error.response?.data || error.message);
      throw this.formatError(error, 'Failed to fetch filtered projects. Please try again.');
    }
  }

  /**
   * Get detailed project information
   */
  async getProjectDetails(projectId: string): Promise<ProjectDetailsResponse> {
    try {
      const response = await backendApi.get(`/projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get Project Details Error:', error.response?.data || error.message);
      throw this.formatError(error, 'Failed to fetch project details. Please try again.');
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await backendApi.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete Project Error:', error.response?.data || error.message);
      throw this.formatError(error, 'Failed to delete project. Please try again.');
    }
  }

  /**
   * Helper: Get status badge styling
   */
  getStatusBadgeStyle(status: ProjectStatus): { bg: string; text: string; label: string } {
    const styles: Record<ProjectStatus, { bg: string; text: string; label: string }> = {
      'analyzing': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Analyzing' },
      'analyzed': { bg: 'bg-blue-200', text: 'text-blue-900', label: 'Analyzed' },
      'planning': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Planning' },
      'planned': { bg: 'bg-purple-200', text: 'text-purple-900', label: 'Planned' },
      'migrating': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Migrating' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
    };
    return styles[status] || styles.analyzing;
  }

  /**
   * Helper: Calculate progress percentage based on status
   */
  getProgressPercentage(status: ProjectStatus): number {
    const progress: Record<ProjectStatus, number> = {
      'analyzing': 10,
      'analyzed': 25,
      'planning': 40,
      'planned': 55,
      'migrating': 75,
      'completed': 100,
      'failed': 0,
    };
    return progress[status] || 0;
  }

  /**
   * Helper: Get next step in migration flow
   */
  getNextStep(status: ProjectStatus): string | null {
    const nextSteps: Record<ProjectStatus, string | null> = {
      'analyzing': 'Waiting for analysis to complete...',
      'analyzed': 'Generate Migration Plan',
      'planning': 'Waiting for migration plan...',
      'planned': 'Start Code Migration',
      'migrating': 'Migration in progress...',
      'completed': null,
      'failed': 'Retry Migration',
    };
    return nextSteps[status];
  }
}

export default new BackendService();
