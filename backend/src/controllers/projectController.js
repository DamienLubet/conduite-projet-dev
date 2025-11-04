import Project from '../models/project.js';

// Create a new project
export const createProject = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Project name is required.' });
        }
        const ownerId = req.user.id;
        if (!ownerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized. User ID not found.' });
        }

        // Check for duplicate project name for the same owner
        const existingProject = await Project.findOne({ name, owner: ownerId });
        if (existingProject) {
            return res.status(400).json({ success: false, message: 'You already have a project with this name.' });
        }

        const newProject = new Project({
            name,
            owner: ownerId,
            members: [{ userID: ownerId, role: 'Scrum Master' }],
        });
        await newProject.save();
        return res.status(201).json({ success: true, message: 'Project created successfully.' });
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}