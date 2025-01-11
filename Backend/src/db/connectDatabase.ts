import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async()=>{
    try {
        if(!process.env.MONGO_URL){
            throw new Error ("MONGODB_URL is not defined")
        }
        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDb Connected : ${connect.connection.host}`);
        
    } catch (error) {
        console.error(`Error from DB: ${error}`)
        process.exit(1)
    }
}