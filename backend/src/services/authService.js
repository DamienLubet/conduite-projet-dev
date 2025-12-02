import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

/** Generate a JWT token for a user
 * @param {Object} user - The user object
 * @returns {string} - The generated JWT token
 */
export function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}