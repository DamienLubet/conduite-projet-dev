import { Schema, model } from 'mongoose';
import Task from './task.js';

const userStorySchema = new Schema({
    number: { type: Number },
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    storyPoints: { type: Number, default: 0 },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sprint: { type: Schema.Types.ObjectId, ref: 'Sprint' },
}, { timestamps: true });

// Auto-increment story number within the same project
userStorySchema.pre('save', async function (next) {
    if (this.isNew) {
        const UserStory = model('UserStory', userStorySchema);
        const lastStory = await UserStory.findOne({ project: this.project }).sort({ number: -1 });
        this.number = lastStory ? lastStory.number + 1 : 1;
    }
    next();
});

userStorySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const userStoryId = this._id;
    await Task.deleteMany({ userStory: userStoryId });
    next();
});

const UserStory = model('UserStory', userStorySchema);
export default UserStory;