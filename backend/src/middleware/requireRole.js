import Project from '../models/project.js';

/**
 * Middleware to require specific user roles within a project.
 * Checks if the authenticated user has one of the allowed roles in the project.
 * If not, responds with 403 Forbidden.
 */

/** Check user role middleware
 * @param {string[]} allowedRoles - Array of roles that are allowed access.
 * @param {string} failMessage - Message to return if the user does not have the required role.
 * @returns {Function} Express middleware function.
 */
const checkRole = (allowedRoles, failMessage) => {
    return async (req, res, next) => {
        const userId = req.user.id;
        let project = req.project;
        if (!project) {
            const projectId = req.projectId || req.params?.projectId;

            project = projectId ? await Project.findById(projectId) : null;

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found."
                });
            }
        }
        
        // Check if the user is a member with the required role
        const member = project.members.find(m => m.userID.toString() === userId);
        if (!member) {
            return res.status(403).json({
                success: false,
                message: "Forbidden. You are not a member of this project."
            });
        }
        if (!allowedRoles.includes(member.role)) {
            return res.status(403).json({
                success: false,
                message: failMessage
            });
        }

        next();
    };
};

/**
 * Predefined role-checking middleware for Scrum Master.
 */
export const requireScrumMaster = checkRole(
    ['Scrum Master'],
    'Forbidden. Scrum Master role required.'
);

/**
 * Predefined role-checking middleware for Developer.
 */
export const requireDeveloper = checkRole(
    ['Developer', 'Scrum Master'],
    'Forbidden. Developer role required.'
);

/** 
 * Predefined role-checking middleware for any project member.
 */
export const requireToBeMember = checkRole(
    ['Developer', 'Scrum Master', 'Viewer'],
    'Forbidden. Not a project member.'
);
