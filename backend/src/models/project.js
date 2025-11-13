import { Schema, model } from 'mongoose';

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
    await this.model('UserStory').deleteMany({ project: projectId });
    //add other related deletions here (e.g., Tasks, Sprints) if featured in the future
    next();
});

const Project = model('Project', projectSchema);
export default Project;