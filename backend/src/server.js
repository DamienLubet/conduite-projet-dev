import express from 'express';
import connectDb from "./config/db.js";

// Load environment variables from .env file
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();
connectDb();



app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
