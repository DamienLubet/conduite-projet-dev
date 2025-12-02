import Project from '../models/project.js';

/**
 * Create a new project
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   name: string,
 *   description?: string
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 201 - Created
 * 400 - Bad Request
 * 401 - Unauthorized
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string,
 *   projectID?: string
 * }
 */
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
        return res.status(201).json({ success: true, message: 'Project created successfully.', projectID: newProject._id });
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}


/** * Get project by ID
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 401 - Unauthorized
 * 404 - Not Found
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   project?: Project,
 *   message?: string
 * }
 */
export const getProjectbyId = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized. User ID not found.' });
        }

        const projectId = req.params.id;
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { owner: userId },
                { "members.userID": userId }
            ]
        }).populate('owner', 'username email').populate('members.userID', 'username email');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
        }
        return res.status(200).json({ success: true, project });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Delete a project
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 401 - Unauthorized
 * 403 - Forbidden
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const deleteProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        const project = await Project.findOne({ _id: projectId, owner: userId });
        if (!project) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only the product owner can delete the project.' });
        }
        await project.deleteOne();
        return res.status(200).json({ success: true, message: 'Project deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Edit a project
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   name?: string,
 *   description?: string
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 401 - Unauthorized
 * 403 - Forbidden
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const editProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        const { name, description } = req.body;
        const project = await Project.findOne({ _id: projectId, owner: userId });
        if (!project) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only the product owner can edit the project.' });
        }
        if (name) {
            const existingProject = await Project.findOne({ name, owner: userId, _id: { $ne: projectId } });
            if (existingProject) {
                return res.status(400).json({ success: false, message: 'You already have a project with this name.' });
            }   
            project.name = name;
        }
        if (description) project.description = description;
        await project.save();
        return res.status(200).json({ success: true, message: 'Project updated successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}