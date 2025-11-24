import express from 'express';
import { createProject, deleteProject, editProject, getProjectbyId } from '../controllers/projectController.js';
import { addProjectMember, changeMemberRole, removeProjectMember } from '../controllers/projectMemberController.js';
import exists from '../middleware/exists.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireScrumMaster } from '../middleware/requireRole.js';
import Project from '../models/project.js';


const projectRouter = express.Router();

// Protect route (need to be authenticated)
projectRouter.use(requireAuth);

projectRouter.post('/projects', createProject);
projectRouter.get('/projects/:id', getProjectbyId);
projectRouter.delete('/projects/:id', deleteProject);
projectRouter.put('/projects/:id', editProject);

// manage project members routes, need Scrum Master role
projectRouter.post('/projects/:id/members', exists(Project, 'id'), requireScrumMaster, addProjectMember);
projectRouter.delete('/projects/:id/members', exists(Project, 'id'), requireScrumMaster, removeProjectMember);
projectRouter.put('/projects/:id/members', exists(Project, 'id'), requireScrumMaster, changeMemberRole);

export default projectRouter;