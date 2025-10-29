import express from 'express';
import connectDb from "./config/db.js";
import authRouter from './routes/authRoutes.js';

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
app.use('/api/auth', authRouter);

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
