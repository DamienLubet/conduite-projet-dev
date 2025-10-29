import { config } from 'dotenv';
import { connect, disconnect } from 'mongoose';

config();

async function connectDB() {
    try {
        console.log("Opening connection");
        const conn = await connect(process.env.MONGO_URI + '/' + process.env.DB_NAME);
        console.log(process.env.MONGO_URI + '/' + process.env.DB_NAME);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(err) { 
        disconnect();
        console.error(err);
        process.exit(1);
    }
}

export default connectDB