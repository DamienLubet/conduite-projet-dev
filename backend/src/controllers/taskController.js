import Project from '../models/project.js';
import Task from '../models/task.js';
import User from '../models/user.js';
import UserStory from '../models/userstory.js';

/** Create a new task
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   title: string,
 *   description?: string
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
 *   message: string
 * }
 */
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

/* Get all tasks for a specific user story
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
 *   data: Task[]
 * }
 */
export const getTasksByUserStory = async (req, res) => {
    try {
        const userStoryId = req.params.userStoryId;
        const tasks = await Task.find({ userStory: userStoryId }).populate('assignee', 'username email');
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Get task by ID
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 404 - Not Found
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   data: Task
 * }
 */
export const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId).populate('assignee', 'username email');
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Update a task
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   title?: string,
 *   description?: string,
 *   status?: string
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
export const updateTask = async (req, res) => {
    try {
        const task = req.task; 
        const { title, description, status } = req.body;

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) {
            if (['To Do', 'In Progress', 'Done'].includes(status)) {
                task.status = status;
            } else {
                return res.status(400).json({ success: false, message: 'Invalid status value.' });
            }
        }
        await task.save();
        res.status(200).json({ success: true, message: 'Task updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Delete a task
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
 *   message: string
 * }
 */
export const deleteTask = async (req, res) => {
    try {
        const task = req.task; 
        await task.deleteOne();
        res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Assign a task to a user
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   assigneeId: string
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 404 - Not Found
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const assignTask = async (req, res) => {
    try {
        const task = req.task; 
        const { assigneeId } = req.body;
        if (!assigneeId) {
            return res.status(400).json({ success: false, message: 'Assignee ID is required.' });
        }
        const user = await User.findById(assigneeId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const project = await Project.findById(task.project);
        const isMember = project.members.some((m) => m.userID.toString() === assigneeId.toString());
        if (!isMember) {
            return res.status(400).json({ success: false, message: 'User is not a member of the project.' });
        }

        task.assignee = assigneeId;
        await task.save();
        res.status(200).json({ success: true, message: 'Task assigned successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}