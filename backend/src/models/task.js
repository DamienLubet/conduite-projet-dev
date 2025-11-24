import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
    number: { type: Number },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    userStory: { type: Schema.Types.ObjectId, ref: 'UserStory', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

// Auto-increment task number within the same user story
taskSchema.pre('save', async function (next) {
    if (this.isNew) {
        const Task = this.constructor;
        const lastTask = await Task.findOne({ userStory: this.userStory }).sort({ number: -1 });
        this.number = lastTask ? lastTask.number + 1 : 1;
    }
    next();
});

const Task = model('Task', taskSchema);
export default Task;