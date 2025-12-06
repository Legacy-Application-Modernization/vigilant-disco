// Types for projects

// Matches Firebase backend status tracking
export type ProjectStatus = 
  | 'analyzing'      // Repository analysis in progress
  | 'analyzed'       // Analysis complete
  | 'planning'       // Migration plan being generated
  | 'planned'        // Migration plan ready
  | 'migrating'      // Code migration in progress
  | 'completed'      // Migration successful
  | 'failed';        // Migration failed

// Legacy statuses for backward compatibility
export type LegacyProjectStatus = 'Completed' | 'In Progress' | 'Needs Review';

export type FrameworkType = 'Laravel' | 'CodeIgniter' | 'Symfony' | 'CakePHP' | 'Other';

// Detailed project interface matching Firebase structure
export interface Project {
  id: string;                      // Firebase document ID
  project_name: string;            // Format: owner/repo
  user_id: string;                 // Firebase user ID
  repository_url: string;          // GitHub repo URL
  source_language: string;         // Always 'PHP'
  target_language: string;         // Always 'NodeJS'
  status: ProjectStatus;           // Current migration status
  created_at: string;              // ISO timestamp
  updated_at: string;              // ISO timestamp
  completed_at?: string;           // ISO timestamp when completed
  error?: string;                  // Error message if failed
  error_timestamp?: string;        // When error occurred
  
  // Legacy fields for backward compatibility
  name?: string;
  description?: string;
  lastUpdated?: string;
  progress?: number;
  framework?: FrameworkType;
  owner?: string;
  repo?: string;
  metadata?: any;
  settings?: any;
}

export interface ProjectsFilterOptions {
  status?: ProjectStatus | LegacyProjectStatus;
  framework?: FrameworkType;
  search?: string;
}

// Request/Response types for API
export interface CreateProjectRequest {
  user_id: string;
  repository_url: string;
  project_name?: string;
}

export interface UpdateProjectStatusRequest {
  status: ProjectStatus;
  error?: string;
}

export interface ProjectDetailsResponse {
  success: boolean;
  project: Project;
}

export interface ProjectsListResponse {
  success: boolean;
  projects: Project[];
  count: number;
}

export interface ProjectStats {
  totalProjects: number;
  filesProcessed: number;
  linesConverted: number;
  avgConversionTime: string;
  projectsCompleted: number;
  projectsInProgress: number;
}

export interface RecentProject {
  id: number;
  name: string;
  date: string;
  status: ProjectStatus;
  files: number;
  loc: number;
  coverage: number;
}

export interface ConversionActivity {
  name: string;
  php: number;
  nodejs: number;
}

export interface TimeData {
  name: string;
  time: number;
}

export interface FrameworkDistribution {
  name: string;
  value: number;
}