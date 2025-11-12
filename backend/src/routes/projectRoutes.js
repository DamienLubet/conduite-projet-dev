import express from 'express';
import { createProject, getProjectbyId } from '../controllers/projectController.js';
import requireAuth from '../middleware/requireAuth.js';


const projectRouter = express.Router();

// Protect route (need to be authenticated)
projectRouter.use(requireAuth);

projectRouter.post('/projects', createProject);
projectRouter.get('/projects/:id', getProjectbyId);

// Protect route
export default projectRouter;