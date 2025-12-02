import User from "../models/user.js";

/** Get a user by their username or email
 * @param {string} identifier - The username or email of the user
 * @returns {Promise<User|null>} - The user object if found, otherwise null
 */
export const getUserByIdentifier = async (identifier) => {
    let user = await User.findOne({ username: identifier });
    if (!user) {
        user = await User.findOne({ email: identifier });
    }
    return user;
};