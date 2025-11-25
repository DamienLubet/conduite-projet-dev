import { Schema, model } from 'mongoose';
// Ensure the models are registered for cascading deletes
import Sprint from './sprint.js';
import Task from './task.js';
import UserStory from './userstory.js';
import Version from './version.js';

const projectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        userID: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Scrum Master', 'Developer', 'Viewer'], default: 'Developer' }
    }],
}, { timestamps: true });

// Cascade delete user stories / tasks / sprints... when a project is deleted
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const projectId = this._id;
    await Version.deleteMany({ project: projectId });
    await Sprint.deleteMany({ project: projectId });
    await Task.deleteMany({ project: projectId });
    await UserStory.deleteMany({ project: projectId });
    next();
});

const Project = model('Project', projectSchema);
export default Project;