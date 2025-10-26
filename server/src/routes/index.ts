import { Router } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import healthRoutes from './health.routes';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check routes (no version prefix)
router.use('/health', healthRoutes);

// API routes with version prefix
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/projects`, projectRoutes);

// API info route
router.get(`${API_VERSION}`, (req, res) => {
  res.json({
    success: true,
    message: 'LegacyModernize API v1 - Firebase Free Tier',
    version: '1.0.0',
    tier: 'free',
    endpoints: {
      users: `${API_VERSION}/users`,
      projects: `${API_VERSION}/projects`,
      health: '/health'
    },
    features: [
      'User Management',
      'Project Management',
      'Firebase Authentication',
      'Firestore Database'
    ],
    documentation: 'https://docs.legacymodernize.com/api/v1'
  });
});

// DO NOT ADD ANY CATCH-ALL ROUTES HERE
// The 404 handling is done in app.ts

export default router;