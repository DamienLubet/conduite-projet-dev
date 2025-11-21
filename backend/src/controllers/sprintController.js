import Sprint from '../models/sprint.js';

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