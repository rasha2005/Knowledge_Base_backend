import express from "express";
const authRouter = express();
import { login, signup } from "../controllers/authController.js";
// import Auth from "../service/auth.js";

authRouter.post('/signup' , signup );
authRouter.post('/login' , login );

export default authRouter