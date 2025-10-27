import { Router } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import healthRoutes from './health.routes';
import githubRoutes from './github.routes';
const router = Router();

// Health check routes (no prefix needed)
router.use('/health', healthRoutes);

// API routes (NO /api/v1 prefix here since it's already mounted at /api/v1 in app.ts)
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/github', githubRoutes);
// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LegacyModernize API v1 - Firebase Free Tier',
    version: '1.0.0',
    tier: 'free',
    endpoints: {
      users: '/api/v1/users',
      projects: '/api/v1/projects',
      health: '/health',
      github: '/api/v1/github'

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

export default router;