import { Schema, model } from 'mongoose';

const sprintSchema = new Schema({
    number: { type: Number },
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

// Auto-increment sprint number within the same project
sprintSchema.pre('save', async function (next) {
    if (this.isNew) {
        const Sprint = model('Sprint', sprintSchema);
        const lastSprint = await Sprint.findOne({ project: this.project }).sort({ number: -1 });
        this.number = lastSprint ? lastSprint.number + 1 : 1;
    }
    if (this.startDate >= this.endDate) {
        return next(new Error('Start date must be before end date'));
    }
    next();
});

// time remaining virtual field
sprintSchema.virtual('timeRemaining').get(function () {
    const now = new Date();
    if (this.endDate < now) {
        return 0;
    }
    const diffTime = Math.abs(this.endDate - now);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const Sprint = model('Sprint', sprintSchema);
export default Sprint;