// Types for user related data

export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  plan: 'Free' | 'Pro' | 'Enterprise';
  joinDate: string;
  company?: string;
  location?: string;
  timezone: string;
  bio?: string;
  projects: number;
  conversions: number;
}

export interface ProjectLimitInfo {
  currentCount: number;
  maxAllowed: number | null; // null means unlimited for admin/manager
  role: UserRole;
}

export interface CanCreateProjectResponse {
  canCreate: boolean;
  reason?: string;
  currentCount?: number;
  maxAllowed?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: 'live' | 'test';
  createdAt: string;
  lastUsed?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'other';
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  current: boolean;
}

export interface NotificationPreferences {
  email: {
    conversionUpdates: boolean;
    projectCollaborations: boolean;
    accountUpdates: boolean;
    marketingPromotions: boolean;
  };
  web: {
    browserNotifications: boolean;
    inAppNotifications: boolean;
  };
  weeklyDigest: {
    enabled: boolean;
    day: 'Monday' | 'Wednesday' | 'Friday' | 'Sunday';
  };
}