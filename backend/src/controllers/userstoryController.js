import UserStory from "../models/userstory.js";

/** Create a new user story
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   title: string,
 *   description?: string,
 *   priority?: string,
 *   storyPoints?: number
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
 *   message: string,
 *   data?: UserStory
 * }
 */
export const createUserStory = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { title, description, priority, storyPoints } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required.' });
        }

        const newUserStory = new UserStory({
            title,
            description,
            priority,
            storyPoints,
            project: projectId,
        });
        await newUserStory.save();
        return res.status(201).json({ success: true, message: 'User story created successfully.', data: newUserStory });
    } catch (error) {
        console.error('Error creating user story:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/* Get all user stories for a specific project
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
 *   data?: UserStory[]
 * }
 */
export const getUserStoriesByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const userStories = await UserStory.find({ project: projectId });
        return res.status(200).json({ success: true, data: userStories });
    } catch (error) {
        console.error('Error retrieving user stories:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/* Get a user story by ID
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
 *   data?: UserStory
 * }
 */
export const getUserStoryById = async (req, res) => {
    try {
        const userStoryId = req.params.id;
        const userStory = await UserStory.findById(userStoryId);
        if (!userStory) {
            return res.status(404).json({ success: false, message: 'User story not found.' });
        }
        return res.status(200).json({ success: true, data: userStory });
    } catch (error) {
        console.error('Error retrieving user story:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Update a user story
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   title?: string,
 *   description?: string,
 *   priority?: string,
 *   storyPoints?: number
 * }
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data?: UserStory
 * }
 */
export const updateUserStory = async (req, res) => {
    try{
    const { title, description, priority, storyPoints } = req.body;
    const userStory = req.userstory; // Retrieved from middleware

    if (title) userStory.title = title;
    if (description) userStory.description = description;
    if (priority) userStory.priority = priority;
    if (storyPoints) userStory.storyPoints = storyPoints;

    await userStory.save();
    return res.status(200).json({ success: true, message: 'User story updated successfully.', data: userStory });
    } catch (error) {
        console.error('Error updating user story:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

/** Delete a user story
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
export const deleteUserStory = async (req, res) => {
    try {
        const userStory = req.userstory; // Retrieved from middleware
        await userStory.deleteOne();
        return res.status(200).json({ success: true, message: 'User story deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user story:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}
