import mongoose from 'mongoose';

// Middleware to check if a document exists in the database by ID
export default function exists(model, idParam) {
    return (req, res, next) => {
        const id = req.params[idParam];
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format.' });
        }
        model.findById(id)
            .then(doc => {
                if (!doc) {
                    return res.status(404).json({ success: false, message: `${model.modelName} not found.` });
                }
                req[model.modelName.toLowerCase()] = doc;
                next();
            })
            .catch(err => {
                console.error(`Error checking existence of ${model.modelName}:`, err);
                return res.status(500).json({ success: false, message: 'Internal server error.' });
            });
    }
}
