import Project from '../models/project.js';

/**
 * Get all projects for the authenticated user
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 401 - Unauthorized
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   projects?: Project[]
 * }
 */
export const getUserProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized. User ID not found.' });
        }
        
        const projects = await Project.find({
            $or: [
            { owner: userId },
            { "members.userID": userId }
            ]
        }).populate('owner', 'username email').populate('members.userID', 'username email');

        return res.status(200).json({ success: true, projects });
    } catch (error) {
        console.error('Error fetching user projects:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
