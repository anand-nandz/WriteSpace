import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './db/connectDatabase';
import path from 'path';
import userRoutes from './routes/userRoutes';
import cookieParser from 'cookie-parser';
import { corsOption } from './config/corsConfig';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express()

app.use(cors(corsOption));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use('/api/user',userRoutes);
app.use(errorHandler)

const PORT = process.env.PORT || 3000
connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on PORT: ${PORT}`);
    })
})
.catch((error)=>{
    console.error(`Database connection failed`,error)
    process.exit(1)
})