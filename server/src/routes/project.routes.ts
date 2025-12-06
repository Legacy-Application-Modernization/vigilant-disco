import { Router } from 'express';
import ProjectController from '../controllers/project.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const projectController = new ProjectController();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD routes
router.post('/', projectController.createProject.bind(projectController));
router.get('/', projectController.getUserProjects.bind(projectController));

// More specific routes MUST come before generic /:id routes
// Project download from S3
router.get('/:id/download', projectController.downloadProject.bind(projectController));

// Project tags (specific route)
router.get('/by-tag/:tag', projectController.getProjectsByTag.bind(projectController));

// Git URL validation
router.post('/validate-git-url', projectController.validateGitUrl.bind(projectController));

// Migrate S3 fields (owner/repo) from repositoryUrl
router.patch('/:id/migrate-s3-fields', projectController.migrateS3Fields.bind(projectController));

// Generic project routes (should be last)
router.get('/:id', projectController.getProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

// Project status management
router.put('/:id/status', projectController.updateProjectStatus.bind(projectController));

// Project notes
router.post('/:id/notes', projectController.addProjectNote.bind(projectController));

export default router;