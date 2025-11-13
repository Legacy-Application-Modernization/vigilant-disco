// Types for the conversion process
// In client/src/types/conversion.ts

export interface UploadedFile {
  name: string;
  size: string;
  type: string;
  path?: string;
}

export interface AnalysisFile {
  path: string;
  filetype: string;
  size: string;
  url: string;
  sha: string;
}

export interface RepositorySummary {
  name: string;
  full_name: string;
  owner: string;
  description: string;
  html_url: string;
  stars: number;
  forks: number;
  languages: string[];
  license?: {
    name: string;
    key: string;
  };
}

export interface Analysis {
  summary: RepositorySummary;
  files: AnalysisFile[];
  total_files: number;
  classes_count: number;
  functions_count: number;
  dependencies: string[];
  readme?: string;
}
export interface UploadedFile {
  name: string;
  size: string;
  type: string;
   content?: string; 
  path?: string;   
}

export interface ConversionOptions {
  useAsync: boolean;
  convertToTypeScript: boolean;
  includeValidation: boolean;
  addErrorHandling: boolean;
  includeDocker: boolean;
  generateUnitTests: boolean;
}

export interface AnalysisResult {
  metrics: {
    totalLinesOfCode: number;
    classesDetected: number;
    functions: number;
    complexityScore: string;
  };
  framework: {
    name: string;
    designPattern: string;
    database: string;
    apiType: string;
  };
  dependencies: {
    externalLibraries: number;
    composerPackages: number;
    nodejsEquivalents: string;
    migrationDifficulty: string;
  };
}

export interface TransformationSummary {
  filesConverted: number;
  linesOfCode: number;
  coverage: number;
  errors: number;
  confidence: number;
}

export interface TransformationData {
  originalCode: string;
  transformedCode: string;
}

export interface FileStructure {
  name: string;
  type: 'file' | 'folder';
  level: number;
}

export interface ConversionStep {
  number: number;
  title: string;
  subtitle: string;
}

export interface KeyChange {
  id: number;
  text: string;
  completed: boolean;
}

export interface ManualReviewItem {
  id: number;
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  primary?: boolean;
}