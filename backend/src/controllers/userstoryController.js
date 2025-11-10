import UserStory from "../models/userstory.js";

// Create a new user story
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
