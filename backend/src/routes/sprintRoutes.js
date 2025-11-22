import express from 'express';
import { createSprint, getSprintsByProject } from '../controllers/sprintController.js';
import exists from '../middleware/exists.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireScrumMaster, requireToBeMember } from '../middleware/requireRole.js';
import Project from '../models/project.js';

const sprintRouter = express.Router();

// Protect route (need to be authenticated)
sprintRouter.use(requireAuth);

sprintRouter.post('/projects/:projectId/sprints', exists(Project, 'projectId'), requireScrumMaster, createSprint);
sprintRouter.get('/projects/:projectId/sprints', exists(Project, 'projectId'), requireToBeMember, getSprintsByProject);

export default sprintRouter;