
import User from "../models/user.js";
import { generateToken } from "../services/authService.js";

/**
 * Register a new user
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   username: string,
 *   email: string,
 *   password: string
 * }       
 * @param {Express.Response} res 
 * @returns 
 * 
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
 * 
 */
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
        }

        // Check for existing username or email for a proper error message
        const existingUsername = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });
        if (existingUsername) {
            return res.status(400).json({ success: false, message: 'Username already taken.' });
        }
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        return res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
};

/**
 * Login a user
 * @param {Express.Request} req 
 * Request Body:
 * {
 *   email: string,
 *   password: string
 * }       
 * @param {Express.Response} res 
 * @returns 
 * HTTP Status Codes:
 * 200 - OK
 * 400 - Bad Request
 * 401 - Unauthorized
 * 404 - Not Found
 * 500 - Internal Server Error
 * 
 * Response JSON Structure:
 * {
 *   success: boolean,
 *   data: {
 *     token: string,
 *     user: {
 *       id: string,
 *       username: string,
 *       email: string
 *     }
 *   } | null,
 *   message: string
 * }
 * 
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'Authentication failed. User not found.' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });

        const token = generateToken(user);

        return res.status(200).json({ success: true, data: { token, user: { id: user._id, username: user.username, email: user.email } } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Internal server error: ' + err.message });
    }
}


