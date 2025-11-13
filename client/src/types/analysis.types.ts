// Analysis Data Types

export interface FrameworkAnalysis {
  framework: string;
  confidence: number;
}

export interface FileSummary {
  file_path: string;
  file_purpose: string;
  file_type: 'CONTROLLER' | 'MODEL' | 'SERVICE' | 'HELPER' | 'REPOSITORY';
  primary_functionality: string | string[];
  responsibility_type: string | string[];
  dependencies: string[];
}

export interface MigrationPhase {
  number: number;
  name: string;
  description: string;
  estimated_time: string;
  file_count: number;
  file_types: string[];
  files: string[];
  risks: string[];
  success_criteria: string;
  testing_strategy: string;
}

export interface DependencyGraph {
  [fileName: string]: string[];
}

export interface ArchitecturalInsights {
  architectural_pattern: string;
  separation_of_concerns: string;
  scalability_considerations: string;
  maintainability_score: string;
  technical_debt_indicators: string;
  migration_to_nodejs_complexity: string;
  recommended_nodejs_architecture: string;
  step_by_step_migration_strategy: string[];
}

export interface AnalysisData {
  framework_analysis: FrameworkAnalysis;
  dependency_graph: DependencyGraph;
  files_summary: FileSummary[];
  migration_phases: MigrationPhase[];
  top_risks: string[];
  code_understanding: string;
  architectural_insights: ArchitecturalInsights;
}

export interface AnalysisStats {
  totalFiles: number;
  totalDependencies: number;
  estimatedMigrationTime: string;
  complexityLevel: 'Low' | 'Medium' | 'High';
  riskCount: number;
}