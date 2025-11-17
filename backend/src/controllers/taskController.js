import Task from '../models/task.js';
import UserStory from '../models/userstory.js';

// Create a new task
export const createTask = async (req, res) => {
    try {
        const userStoryId = req.params.userStoryId;
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required.' });
        }

        const newTask = new Task({
            title,
            description,
            userStory: userStoryId,
            project: await UserStory.findById(userStoryId).then(us => us.project)
        });
        await newTask.save();
        res.status(201).json({ success: true, message: 'Task created successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}