import User from "../models/User.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const signup = async (req, res) => {
    try {
        const data = req.body.data;
        
        const {name , email, password } = data
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({success:false, message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password,10);
    
        const user = new User({
          name,
          email,
          password: hashedPassword,
        });
    
        const savedUser = await user.save();

        console.log('save',savedUser)
    
        // const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "5m" });
    
        // const verifyLink = `${process.env.FRONT_URL}/verify-email?token=${token}`;
    
        // const transporter = nodemailer.createTransport({
        //   service: "gmail",
        //   auth: {
        //     user: process.env.EMAIL,  
        //     pass: process.env.PASSWORD 
        //   },
        // });
    
        // await transporter.sendMail({
        //   to: email,
        //   subject: "Verify your Email",
        //   html: `Click the link to verify your account: <a href="${verifyLink}">Verify Email</a>`,
        // });
    
        res.status(201).json({success:true, message: "User registered successfully", userId: savedUser._id });
      } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message });
      }
}

export const login = async (req, res) => {
    try {
        const data = req.body.data;
        const { email, password } = data;
    
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(200).json({success:true, message: "Invalid email or password" });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(200).json({success:false, message: "Invalid email or password" });
        }
        
        const isProduction = process.env.NODE_ENV === "production"

        
        const token = jwt.sign(
          { id: user._id, email: user.email }, 
          process.env.JWT_SECRET,  
          { expiresIn:process.env.EXPIRES_IN}             
        );

        res.cookie("authToken", token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
        });

        const refreshToken = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.REFRESH_EXPIRES_IN} 
        );
    
  
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
    
        res.status(200).json({
          success:true,
          message: "Login successful",
          user: {
            email: user.email,
            
          },
          
        });
      } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message });
      }
}
