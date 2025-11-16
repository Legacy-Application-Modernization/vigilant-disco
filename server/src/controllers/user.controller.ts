import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import UserService, { UpdateUserData } from '../services/user.service';
import Joi from 'joi';

const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(1).max(100).optional(),
  photoURL: Joi.string().uri().optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark').optional(),
    notifications: Joi.boolean().optional(),
    language: Joi.string().min(2).max(5).optional()
  }).optional()
});

class UserController {
  // Create service instance in methods instead of at module level
  private getUserService(): UserService {
    return new UserService();
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const userService = this.getUserService(); // Create here instead
      let userProfile = await userService.getUserProfile(userId);
      
      if (!userProfile) {
        userProfile = await userService.createUser(userId, {
          email: req.user?.email || '',
          displayName: req.user?.name,
          photoURL: req.user?.picture
        });
      } else {
        await userService.updateLastActive(userId);
      }

      res.json({
        success: true,
        data: userProfile
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'VALIDATION_ERROR',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      const updateData: UpdateUserData = value;
      const userService = this.getUserService(); // Create here
      
      let userProfile = await userService.getUserProfile(userId);
      if (!userProfile) {
        userProfile = await userService.createUser(userId, {
          email: req.user?.email || '',
          displayName: updateData.displayName || req.user?.name,
          photoURL: updateData.photoURL || req.user?.picture,
          preferences: updateData.preferences
        });
      } else {
        userProfile = await userService.updateUserProfile(userId, updateData);
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userProfile
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const userService = this.getUserService();
      await userService.deleteUser(userId);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.getProfile(req, res);
  }

  async initializeUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const userService = this.getUserService();
      let userProfile = await userService.getUserProfile(userId);
      
      if (userProfile) {
        res.json({
          success: true,
          message: 'User already initialized',
          data: userProfile
        });
        return;
      }

      userProfile = await userService.createUser(userId, {
        email: req.user?.email || '',
        displayName: req.user?.name,
        photoURL: req.user?.picture
      });

      res.status(201).json({
        success: true,
        message: 'User profile created successfully',
        data: userProfile
      });
    } catch (error: any) {
      console.error('Initialize user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize user profile',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  async getUserStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const userService = this.getUserService();
      const userProfile = await userService.getUserProfile(userId);

      if (!userProfile) {
        res.status(404).json({
          success: false,
          message: 'User profile not found',
          error: 'USER_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          usage: userProfile.usage,
          plan: userProfile.plan,
          memberSince: userProfile.createdAt
        }
      });
    } catch (error: any) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  async getProjectLimits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const userService = this.getUserService();
      const limitInfo = await userService.getProjectLimitInfo(userId);

      res.json({
        success: true,
        data: limitInfo
      });
    } catch (error: any) {
      console.error('Get project limits error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve project limit information',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  async checkCanCreateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const userService = this.getUserService();
      const canCreate = await userService.canCreateProject(userId);

      res.json({
        success: true,
        data: canCreate
      });
    } catch (error: any) {
      console.error('Check can create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check project creation permission',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

export default UserController;