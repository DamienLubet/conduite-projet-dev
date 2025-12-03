import { getUserByIdentifier } from "../services/userService.js";

/**
 * Add a member to a project
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   email?: string,
 *   username?: string
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
export const addProjectMember = async (req, res) => {
    try {
        const { email, username, role } = req.body;
        const identifier = email || username;

        const user = await getUserByIdentifier(identifier);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const project = req.project;
        const existingMember = project.members.find(member => member.userID.toString() === user._id.toString());
        if (existingMember) {
            return res.status(400).json({ success: false, message: 'User is already a member of the project.' });
        }

        project.members.push({ userID: user._id, role });
        await project.save();
        return res.status(200).json({ success: true, message: 'Member added successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Remove a member from a project
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   email?: string,
 *   username?: string
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
export const removeProjectMember = async (req, res) => {
    try {
        const { email, username } = req.body;
        const identifier = email || username;
        const userToRemove = await getUserByIdentifier(identifier);
        if (!userToRemove) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const project = req.project;
        
        const isMember = project.members.some(
            m => m.userID.toString() === userToRemove._id.toString()
        );

        if (userToRemove._id.toString() === project.owner.toString()) {
            return res.status(400).json({ success: false, message: "You cannot remove the project owner." });
        }

        if (!isMember) {
            return res.status(404).json({
                success: false,
                message: "User is not a member of this project."
            });
        }
        project.members = project.members.filter(
            member => member.userID.toString() !== userToRemove._id.toString()
        );

        await project.save();
        return res.status(200).json({ success: true, message: 'Member removed successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Change a member's role in a project
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   email?: string,
 *   username?: string,
 *   newRole: string
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
export const changeMemberRole = async (req, res) => {
    try {
        const { email, username, newRole } = req.body;
        const identifier = email || username;

        const userToChange = await getUserByIdentifier(identifier);
        if (!userToChange) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const project = req.project;
        const member = project.members.find(
            m => m.userID.toString() === userToChange._id.toString()
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "User is not a member of this project."
            });
        }

        if (member.userID.toString() === project.owner.toString()) {
            return res.status(400).json({ success: false, message: "You cannot change the role of the project owner." });
        }

        const validRoles = ['Scrum Master', 'Developer', 'Viewer'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ success: false, message: 'Invalid role specified.' });
        }
        member.role = newRole;
        await project.save();
        return res.status(200).json({ success: true, message: 'Member role updated successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error.' + error.message });
    }
}