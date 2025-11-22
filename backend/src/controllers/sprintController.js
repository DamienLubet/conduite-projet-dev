import Sprint from '../models/sprint.js';
import UserStory from '../models/userstory.js';

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
        res.status(201).json({ success: true, sprint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSprintsByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const sprints = await Sprint.find({ project: projectId }).lean({ virtuals: true });

        // Get User Stories for each Sprint
        const sprintsWithUS = await Promise.all(sprints.map(async (sprint) => {
            const userStories = await UserStory.find({ sprint: sprint._id });
            return { ...sprint, userStories };
        }));
        res.status(200).json({ success: true, sprints: sprintsWithUS });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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
        res.status(200).json({ success: true, sprint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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
        res.status(500).json({ success: false, message: error.message });
    }
};

        