import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { createTask } from '../controllers/taskController.js';

const taskRouter = express.Router();

// Protect route (need to be authenticated)
taskRouter.use(requireAuth);

taskRouter.post('/userstories/:userStoryId/tasks', createTask);

export default taskRouter;