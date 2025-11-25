import { Schema, model } from 'mongoose';

const versionSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    tag: { type: String, required: true, trim: true },
    description: { type: String },
    releaseDate: { type: Date, required: true },
    sprint: { type: Schema.Types.ObjectId, ref: 'Sprint' },
}, { timestamps: true });

versionSchema.index({ project: 1, tag: 1 }, { unique: true });

const Version = model('Version', versionSchema);
export default Version;