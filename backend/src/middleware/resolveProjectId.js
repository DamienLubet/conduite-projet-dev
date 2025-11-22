// Middleware to resolve projectId from various request parameters
// Will find the project associated with the multiple models if needed
export default async function resolveProjectId(req, res, next) {
    try {
        if (req.userstory) {
            req.projectId = req.userstory.project;
            return next();
        }

        if (req.task) {
            req.projectId = req.task.project;
            return next();
        }

        if (req.sprint) {
            req.projectId = req.sprint.project;
            return next();
        }

        return res.status(400).json({ success: false, message: 'Unable to resolve project from request.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}
