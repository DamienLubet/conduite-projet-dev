import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to require authentication via JWT.
 * Verifies the JWT token from the Authorization header.
 * If valid, attaches the decoded user info to req.user.
 * If invalid or missing, responds with 401 Unauthorized.
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Function} next 
 */
export default function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || req.get('Authorization');
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        if (err.name == 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}
