import express from 'express';
import { createUserStory, getUserStoriesByProject, getUserStoryById } from '../controllers/userstoryController.js';
import exists from '../middleware/exists.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireToBeMember } from '../middleware/requireRole.js';
import resolveProjectId from '../middleware/resolveProjectId.js';
import Project from '../models/project.js';
import UserStory from '../models/userstory.js';


const userstoryRouter = express.Router();

// Protect route (need to be authenticated)
userstoryRouter.use(requireAuth);

userstoryRouter.post('/projects/:projectId/userstories', createUserStory);
userstoryRouter.get('/projects/:projectId/userstories', exists(Project, 'projectId'), requireToBeMember, getUserStoriesByProject);
userstoryRouter.get('/userstories/:id', exists(UserStory, 'id'), resolveProjectId, requireToBeMember, getUserStoryById);

export default userstoryRouter;