import Project from '../models/project.js';

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

export const requireScrumMaster = checkRole(
    ['Scrum Master'],
    'Forbidden. Scrum Master role required.'
);

export const requireDeveloper = checkRole(
    ['Developer', 'Scrum Master'],
    'Forbidden. Developer role required.'
);

export const requireToBeMember = checkRole(
    ['Developer', 'Scrum Master', 'Viewer'],
    'Forbidden. Not a project member.'
);
