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

// Get tasks by user story ID
export const getTasksByUserStory = async (req, res) => {
    try {
        const userStoryId = req.params.userStoryId;
        const tasks = await Task.find({ userStory: userStoryId });
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

// Get a single task by ID
export const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}