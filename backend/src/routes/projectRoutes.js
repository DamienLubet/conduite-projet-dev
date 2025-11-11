import express from 'express';
import { createProject, deleteProject, getProjectbyId } from '../controllers/projectController.js';
import requireAuth from '../middleware/requireAuth.js';


const projectRouter = express.Router();

// Protect route (need to be authenticated)
projectRouter.use(requireAuth);

projectRouter.post('/projects', createProject);
projectRouter.get('/projects/:id', getProjectbyId);
projectRouter.delete('/projects/:id', deleteProject);

// Protect route
export default projectRouter;