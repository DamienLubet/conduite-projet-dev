import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
    password: { type: String, required: true },
    projectsID: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
}, { timestamps: true });

const User = model('User', userSchema);
export default User;