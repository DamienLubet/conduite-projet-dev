/**
 * Middleware to resolve project ID from request objects.
 * Checks for userstory, task, sprint, or version in the request
 * and sets req.projectId accordingly.
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Function} next 
 */
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

        if (req.version) {
            req.projectId = req.version.project;
            return next();
        }

        return res.status(400).json({ success: false, message: 'Unable to resolve project from request.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}
