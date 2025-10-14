/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format bytes to readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTimeString(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 7) {
    return past.toLocaleDateString();
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMins > 0) {
    return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Get status color class names based on status
 */
export function getStatusColorClasses(status: string): { bg: string; text: string } {
  switch (status) {
    case 'Completed':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'In Progress':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'Needs Review':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

/**
 * Parse file content by type
 */
export function parseFileContent(content: string, fileType: string): any {
  if (fileType === 'json') {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return null;
    }
  }
  
  return content;
}