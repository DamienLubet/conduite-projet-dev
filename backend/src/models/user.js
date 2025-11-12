import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';

const SALT_ROUNDS = 10; 

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    // Validation for proper email format
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] }, 
    password: { type: String, required: true },
}, { timestamps: true });

//hash the password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
        this.password = hash;
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
}

const User = model('User', userSchema);
export default User;