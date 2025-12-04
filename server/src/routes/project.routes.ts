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
router.get('/:id', projectController.getProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

// Project status management
router.put('/:id/status', projectController.updateProjectStatus.bind(projectController));

// Project notes
router.post('/:id/notes', projectController.addProjectNote.bind(projectController));

// Project tags
router.get('/by-tag/:tag', projectController.getProjectsByTag.bind(projectController));

// Project download from S3
router.get('/:id/download', projectController.downloadProject.bind(projectController));

// Git URL validation
router.post('/validate-git-url', projectController.validateGitUrl.bind(projectController));

export default router;