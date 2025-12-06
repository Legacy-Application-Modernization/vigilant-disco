import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ProjectService, { CreateProjectData, UpdateProjectData } from '../services/project.service';
import s3Service from '../services/s3.service';
import Joi from 'joi';

const projectService = new ProjectService();

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  sourceLanguage: Joi.string().required(),
  targetLanguage: Joi.string().optional(),
  status: Joi.string().valid('planning', 'in-progress', 'completed', 'archived').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  settings: Joi.object({
    preserveComments: Joi.boolean().optional(),
    modernizePatterns: Joi.boolean().optional(),
    optimizeCode: Joi.boolean().optional(),
    addDocumentation: Joi.boolean().optional(),
    targetFramework: Joi.string().optional(),
    conversionNotes: Joi.string().optional()
  }).optional(),
  metadata: Joi.object({
    repositoryUrl: Joi.string().optional(),
    branch: Joi.string().optional(),
    analysisResult: Joi.any().optional(),
    conversionPlanner: Joi.any().optional(),
    transformationData: Joi.any().optional(),
    fileStructure: Joi.array().optional(),
    estimatedComplexity: Joi.string().valid('low', 'medium', 'high').optional(),
    notes: Joi.string().optional()
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

  // POST /api/projects/validate-git-url - Validate Git URL
  async validateGitUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { url, branch } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          message: 'Git URL is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Basic Git URL validation
      const gitUrlPattern = /^(https?:\/\/)?([\w\.-]+@)?([\w\.-]+)(:\d+)?(\/[\w\.-\/]+)(\.git)?$/;
      const isValidUrl = gitUrlPattern.test(url);

      if (!isValidUrl) {
        res.status(400).json({
          success: false,
          message: 'Invalid Git URL format',
          error: 'INVALID_URL'
        });
        return;
      }

      // Extract repository name from URL
      const urlParts = url.split('/');
      const repoName = urlParts[urlParts.length - 1].replace('.git', '');

      res.json({
        success: true,
        message: 'Git URL is valid',
        data: {
          url,
          branch: branch || 'main',
          repositoryName: repoName,
          isValid: true
        }
      });
    } catch (error: any) {
      console.error('Validate Git URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate Git URL',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  // GET /api/projects/:id/download - Download project from S3
  async downloadProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const projectId = req.params.id;

      console.log('Download request received:', {
        projectId,
        userId,
        path: req.path,
        fullUrl: req.originalUrl
      });

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      // Get project to verify ownership and get metadata
      const project = await projectService.getProject(projectId, userId);

      if (!project) {
        console.log('Project not found:', { projectId, userId });
        res.status(404).json({
          success: false,
          message: 'Project not found or you do not have access to this project',
          error: 'NOT_FOUND'
        });
        return;
      }

      console.log('Project data from Firestore:', {
        id: project.id,
        name: project.name,
        userId: project.userId,
        owner: project.owner,
        repo: project.repo,
        sourceLanguage: project.sourceLanguage,
        hasOwner: !!project.owner,
        hasRepo: !!project.repo,
        repositoryUrl: project.metadata?.repositoryUrl
      });

      // Extract S3 information from project
      // S3 Structure: userId/ownerName/filename.zip
      // The userId should come from the project document (user_id field in Firestore)
      // NOT from the authenticated user's token
      // Example: 0JEGH9KEOjNOA7usjdjNlMd5go42/Legacy-Application-Modernization/Blog-API-PHP.zip
      
      // Support both userId (Node.js format) and user_id (FastAPI format)
      const s3UserId = (project as any).user_id || project.userId;
      
      // Try to get owner and repo from project fields first
      // If not available, extract from repositoryUrl
      let ownerName = project.owner;
      let repoName = project.repo;
      
      if (!ownerName || !repoName) {
        const repositoryUrl = project.metadata?.repositoryUrl;
        if (repositoryUrl) {
          try {
            const urlParts = repositoryUrl.replace(/\.git$/, '').split('/');
            if (urlParts.length >= 2) {
              repoName = repoName || urlParts[urlParts.length - 1];
              ownerName = ownerName || urlParts[urlParts.length - 2];
              console.log('Extracted from repositoryUrl:', { ownerName, repoName, repositoryUrl });
            }
          } catch (e) {
            console.error('Error parsing repository URL:', e);
          }
        }
      }
      
      // Fallback to defaults if still not available
      ownerName = ownerName || 'default';
      repoName = repoName || project.name.replace(/\s+/g, '-');
      
      // File name is just the repo name with .zip extension
      // The repo name already includes the format like "Blog-API-PHP"
      const fileName = `${repoName}.zip`;
      
      console.log('Download request:', {
        projectId,
        projectName: project.name,
        s3UserId,
        authenticatedUserId: userId,
        owner: ownerName,
        repo: repoName,
        fileName,
        s3Path: `${s3UserId}/${ownerName}/${fileName}`
      });

      // Generate presigned URL for download
      const downloadUrl = await s3Service.getDownloadUrl(
        s3UserId,
        ownerName,
        fileName,
        3600 // URL expires in 1 hour
      );

      res.json({
        success: true,
        message: 'Download URL generated successfully',
        data: {
          downloadUrl,
          fileName,
          expiresIn: 3600,
          s3Path: `${s3UserId}/${ownerName}/${fileName}`,
          owner: ownerName,
          repo: repoName
        }
      });
    } catch (error: any) {
      console.error('Download project error:', error);
      
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Project file not found in storage',
          error: 'FILE_NOT_FOUND'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to generate download URL',
          error: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
  }

  // PATCH /api/projects/:id/migrate-s3-fields - Migrate owner/repo fields from repositoryUrl
  async migrateS3Fields(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const project = await projectService.getProject(projectId, userId);

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      // Extract owner and repo from repositoryUrl if not already set
      let owner = project.owner;
      let repo = project.repo;

      if (!owner || !repo) {
        const repositoryUrl = project.metadata?.repositoryUrl;
        if (repositoryUrl) {
          try {
            const urlParts = repositoryUrl.replace(/\.git$/, '').split('/');
            if (urlParts.length >= 2) {
              repo = repo || urlParts[urlParts.length - 1];
              owner = owner || urlParts[urlParts.length - 2];
            }
          } catch (e) {
            console.error('Error parsing repository URL:', e);
          }
        }
      }

      // Update project with owner and repo
      const updatedProject = await projectService.updateProject(projectId, userId, {
        owner,
        repo
      });

      res.json({
        success: true,
        message: 'Project S3 fields migrated successfully',
        data: {
          id: updatedProject.id,
          owner: updatedProject.owner,
          repo: updatedProject.repo
        }
      });
    } catch (error: any) {
      console.error('Migrate S3 fields error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to migrate S3 fields',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

export default ProjectController;