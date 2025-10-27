import { Router } from 'express';
import githubController from '../controllers/github.controller';

const router = Router();

/**
 * @route   GET /api/v1/github/auth
 * @desc    Get GitHub OAuth authorization URL
 * @access  Public
 */
router.get('/auth', githubController.getAuthUrl);

/**
 * @route   POST /api/v1/github/callback
 * @desc    Handle GitHub OAuth callback and exchange code for token
 * @access  Public
 */
router.post('/callback', githubController.handleCallback);

/**
 * @route   GET /api/v1/github/repos
 * @desc    Get user's GitHub repositories
 * @access  Private (requires GitHub token)
 */
router.get('/repos', githubController.getRepositories);

/**
 * @route   GET /api/v1/github/repos/:owner/:repo/contents
 * @desc    Get repository contents
 * @access  Private (requires GitHub token)
 */
router.get('/repos/:owner/:repo/contents', githubController.getRepoContents);

/**
 * @route   GET /api/v1/github/repos/:owner/:repo/file
 * @desc    Get file content from repository
 * @access  Private (requires GitHub token)
 */
router.get('/repos/:owner/:repo/file', githubController.getFileContent);

/**
 * @route   POST /api/v1/github/repos/:owner/:repo/search-php
 * @desc    Search for PHP files recursively in repository
 * @access  Private (requires GitHub token)
 */
router.post('/repos/:owner/:repo/search-php', githubController.searchPhpFiles);

export default router;