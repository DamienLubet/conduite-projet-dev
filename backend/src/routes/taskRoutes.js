import express from 'express';
import { assignTask, createTask, deleteTask, getTaskById, getTasksByUserStory, updateTask } from '../controllers/taskController.js';
import exists from '../middleware/exists.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireDeveloper, requireScrumMaster, requireToBeMember } from '../middleware/requireRole.js';
import resolveProjectId from '../middleware/resolveProjectId.js';
import Task from '../models/task.js';
import UserStory from '../models/userstory.js';

const taskRouter = express.Router();

// Protect route (need to be authenticated)
taskRouter.use(requireAuth);

taskRouter.post('/userstories/:userStoryId/tasks', exists(UserStory, 'userStoryId'), resolveProjectId, requireDeveloper, createTask);
taskRouter.get('/userstories/:userStoryId/tasks', exists(UserStory, 'userStoryId'), resolveProjectId, requireToBeMember, getTasksByUserStory);
taskRouter.get('/tasks/:id', exists(Task, 'id'), resolveProjectId, requireToBeMember, getTaskById);
taskRouter.put('/tasks/:id', exists(Task, 'id'), resolveProjectId, requireDeveloper, updateTask);
taskRouter.delete('/tasks/:id', exists(Task, 'id'), resolveProjectId, requireScrumMaster, deleteTask);
taskRouter.put('/tasks/:id/assign', exists(Task, 'id'), resolveProjectId, requireDeveloper, assignTask);

export default taskRouter;