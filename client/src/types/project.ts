// Types for projects

export type ProjectStatus = 'Completed' | 'In Progress' | 'Needs Review';

export type FrameworkType = 'Laravel' | 'CodeIgniter' | 'Symfony' | 'CakePHP' | 'Other';

export interface Project {
  id: number;
  name: string;
  description: string;
  lastUpdated: string;
  status: ProjectStatus;
  progress: number;
  framework: FrameworkType;
}

export interface ProjectsFilterOptions {
  status?: ProjectStatus;
  framework?: FrameworkType;
  search?: string;
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