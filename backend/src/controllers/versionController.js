import Sprint from '../models/sprint.js';
import Version from '../models/version.js';
import { newVersion } from '../services/versionService.js';

/**
 * Create a new version
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   description: string,
 *   sprintId: string,
 *   type: string
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 201 - Created
 * 400 - Bad Request
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string,
 *   version?: Version
 * }
 */
export const createVersion = async (req, res) => {
    try {
        const { description, sprintId, type } = req.body;
        const project = req.params.projectId;

        const sprint = await Sprint.findById(sprintId);
        if (!sprint || sprint.project.toString() !== project) {
            return res.status(400).json({ success: false, message: 'Invalid sprint for the specified project' });
        }
        try {
            const version = await newVersion(sprint, type, description);
            res.status(201).json({ success: true, message: 'Version created successfully', version });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/** Update an existing version
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   description?: string,
 *   releaseDate?: Date
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const updateVersion = async (req, res) => {
    try {
        const version = req.version;
        const { description, releaseDate } = req.body;
        if (description) version.description = description;
        if (releaseDate) version.releaseDate = new Date(releaseDate);
        await version.save();
        res.status(200).json({ success: true, message: 'Version updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/** Get all versions for a specific project
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   versions?: Version[]
 * }
 */
export const getVersionsByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const versions = await Version.find({ project: projectId }).sort({ createdAt: -1 }).populate('sprint', 'name number' );
        res.status(200).json({ success: true, versions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};