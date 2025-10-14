import type { 
  ConversionActivity,
  TimeData,
  FrameworkDistribution
} from '../types/project';

// Sample data for charts
export const conversionData: ConversionActivity[] = [
  { name: 'Week 1', php: 12, nodejs: 10 },
  { name: 'Week 2', php: 19, nodejs: 15 },
  { name: 'Week 3', php: 15, nodejs: 14 },
  { name: 'Week 4', php: 27, nodejs: 25 }
];

export const timeData: TimeData[] = [
  { name: 'Mon', time: 5 },
  { name: 'Tue', time: 8 },
  { name: 'Wed', time: 12 },
  { name: 'Thu', time: 15 },
  { name: 'Fri', time: 10 },
  { name: 'Sat', time: 6 },
  { name: 'Sun', time: 3 }
];

export const frameworkData: FrameworkDistribution[] = [
  { name: 'Laravel', value: 65 },
  { name: 'CodeIgniter', value: 15 },
  { name: 'Symfony', value: 10 },
  { name: 'CakePHP', value: 8 },
  { name: 'Other', value: 2 }
];

export const performanceData = [
  { month: 'Jan', success: 92, failure: 8 },
  { month: 'Feb', success: 88, failure: 12 },
  { month: 'Mar', success: 95, failure: 5 },
  { month: 'Apr', success: 99, failure: 1 },
  { month: 'May', success: 85, failure: 15 },
  { month: 'Jun', success: 90, failure: 10 },
  { month: 'Jul', success: 94, failure: 6 },
  { month: 'Aug', success: 97, failure: 3 },
  { month: 'Sep', success: 91, failure: 9 },
  { month: 'Oct', success: 95, failure: 5 }
];

export const issuesData = [
  { 
    id: 1, 
    type: 'Database Connection',
    frequency: 35,
    impact: 'High',
    projects: 8,
    status: 'Common'
  },
  { 
    id: 2, 
    type: 'Authentication Flow',
    frequency: 22,
    impact: 'Medium',
    projects: 5,
    status: 'Common'
  },
  { 
    id: 3, 
    type: 'File Upload Handling',
    frequency: 15,
    impact: 'Medium',
    projects: 4,
    status: 'Common'
  },
  { 
    id: 4, 
    type: 'Session Management',
    frequency: 12,
    impact: 'High',
    projects: 6,
    status: 'Common'
  },
  { 
    id: 5, 
    type: 'Route Configuration',
    frequency: 10,
    impact: 'Low',
    projects: 7,
    status: 'Occasional'
  }
];