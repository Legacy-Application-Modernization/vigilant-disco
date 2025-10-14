export const SUPPORTED_PHP_EXTENSIONS = ['.php', '.phtml', '.inc'];
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

export const DEFAULT_CONVERSION_OPTIONS = {
  useAsync: true,
  convertToTypeScript: false,
  includeValidation: true,
  addErrorHandling: true,
  includeDocker: false,
  generateUnitTests: false
};

export const CHART_COLORS = {
  indigo: '#6366f1',
  emerald: '#10b981',
  amber: '#f59e0b',
  blue: '#3b82f6',
  pink: '#ec4899'
};

export const STATUS_COLORS = {
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  inProgress: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  needsReview: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800'
  }
};

export const FRAMEWORK_ICONS = {
  Laravel: '🔴',
  CodeIgniter: '🟠',
  Symfony: '⚫',
  CakePHP: '🔵',
  Other: '⚪'
};

export const API_ENDPOINTS = {
  projects: '/api/projects',
  conversion: '/api/conversion',
  analysis: '/api/analysis',
  export: '/api/export'
};

export const DASHBOARD_REFRESH_INTERVAL = 60000; // 1 minute