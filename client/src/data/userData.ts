import type { User, ApiKey, PaymentMethod, BillingInvoice } from '../types/user';

export const currentUser: User = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6366f1&color=fff',
  role: 'user',
  plan: 'Pro',
  joinDate: 'January 15, 2025',
  company: 'TechFusion Inc.',
  location: 'San Francisco, CA',
  timezone: 'Pacific Standard Time (PST)',
  bio: 'Full-stack developer with over 8 years of experience. Specialized in PHP and JavaScript frameworks with a focus on migrating legacy applications to modern tech stacks.',
  projects: 24,
  conversions: 125
};

export const apiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Live API Key',
    key: 'pk_live_51H****************',
    type: 'live',
    createdAt: '2025-05-10T14:30:00Z',
    lastUsed: '2025-10-05T08:15:30Z'
  },
  {
    id: '2',
    name: 'Test API Key',
    key: 'pk_test_51H****************',
    type: 'test',
    createdAt: '2025-05-10T14:35:00Z',
    lastUsed: '2025-09-28T11:42:15Z'
  }
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'visa',
    lastFour: '4242',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true
  },
  {
    id: '2',
    type: 'mastercard',
    lastFour: '5555',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false
  }
];

export const billingInvoices: BillingInvoice[] = [
  {
    id: 'INV-2025-1012',
    date: 'Oct 12, 2025',
    amount: 49.00,
    status: 'paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-2025-0912',
    date: 'Sep 12, 2025',
    amount: 49.00,
    status: 'paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-2025-0812',
    date: 'Aug 12, 2025',
    amount: 49.00,
    status: 'paid',
    downloadUrl: '#'
  }
];