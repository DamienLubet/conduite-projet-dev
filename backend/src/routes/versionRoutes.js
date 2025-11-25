import express from 'express';
import { createVersion, getVersionsByProject, updateVersion } from "../controllers/versionController.js";
import exists from '../middleware/exists.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireScrumMaster, requireToBeMember } from '../middleware/requireRole.js';
import resolveProjectId from '../middleware/resolveProjectId.js';
import Project from '../models/project.js';
import Version from '../models/version.js';

const versionRouter = express.Router();

// Protect route (need to be authenticated)
versionRouter.use(requireAuth);

versionRouter.post('/projects/:projectId/versions', exists(Project, 'projectId'), requireScrumMaster, createVersion);
versionRouter.get('/projects/:projectId/versions', exists(Project, 'projectId'), requireToBeMember, getVersionsByProject);
versionRouter.put('/versions/:versionId', exists(Version, 'versionId'), resolveProjectId, requireScrumMaster, updateVersion);


export default versionRouter;