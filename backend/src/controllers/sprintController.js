import Sprint from '../models/sprint.js';
import UserStory from '../models/userstory.js';
import { newVersion } from '../services/versionService.js';

/**
 * Create a new sprint
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   name: string,
 *   description?: string,
 *   startDate: Date,
 *   endDate: Date
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
 *   sprint?: Sprint
 * }
 */
export const createSprint = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;
        const project = req.params.projectId;
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ success: false, message: 'Start date must be before end date' });
        }
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Name, start date, and end date are required' });
        }
        
        const sprint = new Sprint({ name, description, startDate, endDate, project });
        await sprint.save();
        res.status(201).json({ success: true, message: 'Sprint created successfully', sprint });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/** Delete a sprint
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const deleteSprint = async (req, res) => {
    try {
        const sprint = req.sprint;
        if (sprint.status === 'active' || sprint.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Active or completed sprints cannot be deleted' });
        }
        await sprint.deleteOne();
        res.status(200).json({ success: true, message: 'Sprint deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' + error.message });
    }
};

/** Get all sprints for a project
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
 *   sprints?: Array<Sprint>
 * }
 */
export const getSprintsByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const sprints = await Sprint.find({ project: projectId });

        // Get User Stories for each Sprint
        const sprintsWithUS = await Promise.all(sprints.map(async (sprint) => {
            const userStories = await UserStory.find({ sprint: sprint._id });
            const { timeRemaining } = sprint;
            return { ...sprint.toObject({ virtuals: true }), userStories, timeRemaining };
        }));
        res.status(200).json({ success: true, sprints: sprintsWithUS });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/** Update a sprint
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   name?: string,
 *   description?: string,
 *   startDate?: Date,
 *   endDate?: Date
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const updateSprint = async (req, res) => {
    try {
        const sprint = req.sprint; // Retrieved from middleware
        const { name, description, startDate, endDate } = req.body;

        if (name) sprint.name = name;
        if (description) sprint.description = description;
        if (startDate) sprint.startDate = new Date(startDate);
        if (endDate) sprint.endDate = new Date(endDate);

        if (sprint.startDate >= sprint.endDate) {
            return res.status(400).json({ success: false, message: 'Start date must be before end date' });
        }

        await sprint.save();
        res.status(200).json({ success: true, message: 'Sprint updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/** Assign User Stories to a sprint
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   userStoriesIDs: Array<string>
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const assignUserStoriesToSprint = async (req, res) => {
    try {
        const sprintId = req.params.sprintId;
        const sprint = req.sprint;
        const { userStoriesIDs } = req.body;

        if (!Array.isArray(userStoriesIDs) || userStoriesIDs.length === 0) {
            return res.status(400).json({ success: false, message: 'userStoriesIDs must be a non-empty array' });
        }

        const validUS = await UserStory.find({ _id: { $in: userStoriesIDs }, project: sprint.project });
        if (validUS.length !== userStoriesIDs.length) {
            return res.status(400).json({ success: false, message: 'Some user stories are invalid or do not belong to the sprint\'s project' });
        }

        await UserStory.updateMany(
            { _id: { $in: userStoriesIDs } },
            { $set: { sprint: sprintId } }
        );

        res.status(200).json({ success: true, message: `User Stories assigned to sprint successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.'});
    }
};

/** Start a sprint
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const startSprint = async (req, res) => {
    try {
        const sprint = req.sprint;

        if (sprint.status !== 'planned') {
            return res.status(400).json({ success: false, message: 'Only planned sprints can be started' });
        }

        sprint.status = 'active';
        sprint.startDate = new Date();
        await sprint.save();     
        res.status(200).json({ success: true, message: 'Sprint started successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/** Complete a sprint
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   type?: string (semantic versioning type: 'major', 'minor', 'patch')
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const completeSprint = async (req, res) => {
    try {
        const sprint = req.sprint;

        if (sprint.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Only active sprints can be completed' });
        }

        const { type } = req.body ?? {};
        sprint.status = 'completed';
        sprint.endDate = new Date();
        try {
            await newVersion(sprint, type || 'minor');
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        await sprint.save();     
        res.status(200).json({ success: true, message: 'Sprint completed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}