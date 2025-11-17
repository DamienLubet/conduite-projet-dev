import express from 'express';
import { createTask, getTaskById, getTasksByUserStory } from '../controllers/taskController.js';
import exists from '../middleware/exists.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireToBeMember } from '../middleware/requireRole.js';
import resolveProjectId from '../middleware/resolveProjectId.js';
import Task from '../models/task.js';
import UserStory from '../models/userstory.js';

const taskRouter = express.Router();

// Protect route (need to be authenticated)
taskRouter.use(requireAuth);

taskRouter.post('/userstories/:userStoryId/tasks', createTask);
taskRouter.get('/userstories/:userStoryId/tasks', exists(UserStory, 'userStoryId'), resolveProjectId, requireToBeMember, getTasksByUserStory);
taskRouter.get('/tasks/:id', exists(Task, 'id'), resolveProjectId, requireToBeMember, getTaskById);

export default taskRouter;