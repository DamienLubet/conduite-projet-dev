import express from 'express';
import connectDb from "./config/db.js";
import authRouter from './routes/authRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import userstoryRouter from './routes/userstoryRoutes.js';

// Load environment variables from .env file
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Initialize Express app and connect to the database
const app = express();
connectDb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRouter);
app.use('/api', projectRouter);
app.use('/api', userstoryRouter);

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
