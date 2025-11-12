import express from 'express';
import { createUserStory } from '../controllers/userstoryController.js';
import requireAuth from '../middleware/requireAuth.js';

const userstoryRouter = express.Router();

// Protect route (need to be authenticated)
userstoryRouter.use(requireAuth);

userstoryRouter.post('/projects/:projectId/userstories', createUserStory);

// Protect route
export default userstoryRouter;