import User from "../models/user.js";

// Get a user from is name or email
export const getUserByIdentifier = async (identifier) => {
    let user = await User.findOne({ username: identifier });
    if (!user) {
        user = await User.findOne({ email: identifier });
    }
    return user;
};