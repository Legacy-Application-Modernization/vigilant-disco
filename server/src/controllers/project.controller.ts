import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ProjectService, { CreateProjectData, UpdateProjectData } from '../services/project.service';
import Joi from 'joi';

const projectService = new ProjectService();

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  sourceLanguage: Joi.string().required(),
  targetLanguage: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  settings: Joi.object({
    preserveComments: Joi.boolean().optional(),
    modernizePatterns: Joi.boolean().optional(),
    optimizeCode: Joi.boolean().optional(),
    addDocumentation: Joi.boolean().optional(),
    targetFramework: Joi.string().optional(),
    conversionNotes: Joi.string().optional()
  }).optional()
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  targetLanguage: Joi.string().optional(),
  settings: Joi.object({
    preserveComments: Joi.boolean().optional(),
    modernizePatterns: Joi.boolean().optional(),
    optimizeCode: Joi.boolean().optional(),
    addDocumentation: Joi.boolean().optional(),
    targetFramework: Joi.string().optional(),
    conversionNotes: Joi.string().optional()
  }).optional(),
  metadata: Joi.object({
    estimatedComplexity: Joi.string().valid('low', 'medium', 'high').optional(),
    notes: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }).optional()
});

const querySchema = Joi.object({
  limit: Joi.number().min(1).max(50).default(20),
  startAfter: Joi.string().optional(),
  status: Joi.string().valid('draft', 'planning', 'in-progress', 'completed', 'archived').optional()
});

class ProjectController {
  // POST /api/projects - Create a new project
  async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Validate request body
      const { error, value } = createProjectSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'VALIDATION_ERROR',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      const projectData: CreateProjectData = value;
      const project = await projectService.createProject(userId, projectData);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error: any) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // GET /api/projects - Get user's projects
  async getUserProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Validate query parameters
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'VALIDATION_ERROR',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      const { limit, startAfter, status } = value;
      const result = await projectService.getUserProjects(userId, limit, startAfter, status);

      res.json({
        success: true,
        data: result.projects,
        pagination: {
          hasMore: result.hasMore,
          lastDoc: result.lastDoc,
          limit
        }
      });
    } catch (error: any) {
      console.error('Get user projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve projects',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // GET /api/projects/:id - Get a specific project
  async getProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const projectId = req.params.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const project = await projectService.getProject(projectId, userId);
      
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error: any) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve project',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // PUT /api/projects/:id - Update a project
  async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const projectId = req.params.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Validate request body
      const { error, value } = updateProjectSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'VALIDATION_ERROR',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      const updateData: UpdateProjectData = value;
      const project = await projectService.updateProject(projectId, userId, updateData);

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error: any) {
      console.error('Update project error:', error);
      
      if (error.message === 'Project not found or access denied') {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update project',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // DELETE /api/projects/:id - Delete a project
  async deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const projectId = req.params.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      await projectService.deleteProject(projectId, userId);

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete project error:', error);
      
      if (error.message === 'Project not found or access denied') {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete project',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // PUT /api/projects/:id/status - Update project status
  async updateProjectStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const projectId = req.params.id;
      const { status } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      if (!projectId || !status) {
        res.status(400).json({
          success: false,
          message: 'Project ID and status are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Validate status
      const validStatuses = ['draft', 'planning', 'in-progress', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status value',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      await projectService.updateProjectStatus(projectId, userId, status);

      res.json({
        success: true,
        message: 'Project status updated successfully'
      });
    } catch (error: any) {
      console.error('Update project status error:', error);
      
      if (error.message === 'Project not found or access denied') {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update project status',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // POST /api/projects/:id/notes - Add notes to project
  async addProjectNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const projectId = req.params.id;
      const { note } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      if (!projectId || !note) {
        res.status(400).json({
          success: false,
          message: 'Project ID and note are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      await projectService.addProjectNote(projectId, userId, note);

      res.json({
        success: true,
        message: 'Project note added successfully'
      });
    } catch (error: any) {
      console.error('Add project note error:', error);
      
      if (error.message === 'Project not found or access denied') {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add project note',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // GET /api/projects/by-tag/:tag - Get projects by tag
  async getProjectsByTag(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const tag = req.params.tag;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      if (!tag) {
        res.status(400).json({
          success: false,
          message: 'Tag is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const projects = await projectService.getProjectsByTag(userId, tag);

      res.json({
        success: true,
        data: projects
      });
    } catch (error: any) {
      console.error('Get projects by tag error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve projects by tag',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

export default ProjectController;