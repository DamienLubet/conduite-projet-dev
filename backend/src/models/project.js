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

const Project = model('Project', projectSchema);
export default Project;