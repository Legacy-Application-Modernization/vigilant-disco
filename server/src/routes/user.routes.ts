import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));
router.delete('/profile', userController.deleteAccount.bind(userController));

// Alternative route for getting current user (alias)
router.get('/me', userController.getCurrentUser.bind(userController));

// Initialize user profile (typically called on first login)
router.post('/initialize', userController.initializeUser.bind(userController));

// Get user statistics
router.get('/stats', userController.getUserStats.bind(userController));

// Project limit routes
router.get('/project-limits', userController.getProjectLimits.bind(userController));
router.get('/can-create-project', userController.checkCanCreateProject.bind(userController));

export default router;

// Admin routes - update user roles
router.put('/admin/update-role', userController.updateUserRole.bind(userController));
