import express from 'express';
import { assignUserStoriesToSprint, createSprint, getSprintsByProject, updateSprint, deleteSprint, startSprint, completeSprint } from '../controllers/sprintController.js';
import exists from '../middleware/exists.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireScrumMaster, requireToBeMember } from '../middleware/requireRole.js';
import resolveProjectId from '../middleware/resolveProjectId.js';
import Project from '../models/project.js';
import Sprint from '../models/sprint.js';

const sprintRouter = express.Router();

// Protect route (need to be authenticated)
sprintRouter.use(requireAuth);

sprintRouter.post('/projects/:projectId/sprints', exists(Project, 'projectId'), requireScrumMaster, createSprint);
sprintRouter.get('/projects/:projectId/sprints', exists(Project, 'projectId'), requireToBeMember, getSprintsByProject);
sprintRouter.put('/sprints/:sprintId', exists(Sprint, 'sprintId'), resolveProjectId, requireScrumMaster, updateSprint);
sprintRouter.delete('/sprints/:sprintId', exists(Sprint, 'sprintId'), resolveProjectId, requireScrumMaster, deleteSprint);
sprintRouter.post('/sprints/:sprintId/userstories', exists(Sprint, 'sprintId'), resolveProjectId, requireScrumMaster, assignUserStoriesToSprint);
sprintRouter.post('/sprints/:sprintId/start', exists(Sprint, 'sprintId'), resolveProjectId, requireScrumMaster, startSprint);
sprintRouter.post('/sprints/:sprintId/complete', exists(Sprint, 'sprintId'), resolveProjectId, requireScrumMaster, completeSprint);

export default sprintRouter;