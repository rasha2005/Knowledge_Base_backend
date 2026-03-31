import express from 'express'
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from './routes/authRoute.js';
import router from './routes/articleRoute.js';


const app = express();

app.use(cookieParser());

dotenv.config();

app.use(cors({
  origin: process.env.FRONT_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URL ;
mongoose.connect(MONGO_URI)
.then(() => console.log("db is connected"))
.catch((err) => console.log(err))


app.use("/api/auth", authRouter);
app.use("/api", router);


const port = process.env.PORT || 3000

app.listen(port , () => {
    console.log(`server is listening at http://localhost:${port}`)
})

