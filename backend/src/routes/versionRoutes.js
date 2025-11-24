import express from 'express';
import { createVersion, getVersionsByProject, updateVersion } from "../controllers/versionController";
import exists from '../middleware/exists';
import requireAuth from '../middleware/requireAuth';
import { requireScrumMaster, requireToBeMember } from '../middleware/requireRole';
import resolveProjectId from '../middleware/resolveProjectId';
import Project from '../models/project';
import Version from '../models/version.js';

const versionRouter = express.Router();

// Protect route (need to be authenticated)
versionRouter.use(requireAuth);

versionRouter.post('/projects/:projectId/versions', exists(Project, 'projectId'), requireScrumMaster, createVersion);
versionRouter.get('/projects/:projectId/versions', exists(Project, 'projectId'), requireToBeMember, getVersionsByProject);
versionRouter.put('/versions/:versionId', exists(Version, 'versionId'), resolveProjectId, requireScrumMaster, updateVersion);


export default versionRouter;