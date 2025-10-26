// src/utils/dateUtils.ts

/**
 * Format a date to a readable string
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    // Format as "Oct 25, 2025"
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param date - Date object, string, or timestamp
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    } else {
      // For dates older than a year, show the actual date
      return formatDate(date);
    }
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Format a date for form inputs (YYYY-MM-DD)
 * @param date - Date object, string, or timestamp
 * @returns ISO date string
 */
export const formatDateForInput = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

/**
 * Format a date with time (e.g., "Oct 25, 2025 at 2:30 PM")
 * @param date - Date object, string, or timestamp
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Check if a date is today
 * @param date - Date object, string, or timestamp
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  try {
    const dateObj = new Date(date);
    const today = new Date();
    
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is yesterday
 * @param date - Date object, string, or timestamp
 * @returns Boolean indicating if the date is yesterday
 */
export const isYesterday = (date: Date | string | number): boolean => {
  try {
    const dateObj = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return (
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear()
    );
  } catch (error) {
    return false;
  }
};