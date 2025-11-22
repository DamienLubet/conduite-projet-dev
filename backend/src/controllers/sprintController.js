import Sprint from '../models/sprint.js';
import User from '../models/user.js';
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