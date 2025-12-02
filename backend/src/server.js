import express from 'express';
import connectDb from "./config/db.js";
import authRouter from './routes/authRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import sprintRouter from './routes/sprintRoutes.js';
import taskRouter from './routes/taskRoutes.js';
import userRouter from './routes/userRoutes.js';
import userstoryRouter from './routes/userstoryRoutes.js';
import versionRouter from './routes/versionRoutes.js';

const PORT = 80

// Initialize Express app and connect to the database
const app = express();
connectDb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRouter);
app.use('/api', projectRouter);
app.use('/api', userRouter);
app.use('/api', userstoryRouter);
app.use('/api', taskRouter);
app.use('/api', sprintRouter);
app.use('/api', versionRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running ...`);
});
