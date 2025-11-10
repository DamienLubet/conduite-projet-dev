import express from 'express';
import { getUserProjects } from '../controllers/userController.js';
import requireAuth from '../middleware/requireAuth.js';

const userRouter = express.Router();

// Protect route (need to be authenticated)
userRouter.use(requireAuth);

userRouter.get('/user/projects', getUserProjects);

export default userRouter;