import express from "express"
import User from '../models/user.js'
import authMiddle from "../middlewares/authMiddleware.js";
const router = express.Router();
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js"


//Register user 

router.post("/register", async (req,res) => 
{

     const {username, email, password} = req.body;
   

     let flag= await User.findOne({ $or:[{username},{email}] });
     if(flag)
     {
          return res.status(400).json({ message: "user already exist"});
     }
 
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);
 
     flag = new User({username, email, password: hashedPassword});
     await flag.save();
     console.log(flag);
     res.json({
         message: "user registered sucessfully"
     })

})

//Login user

 router.post('/login',async (req,res)=>{
   
try {
     const {email, password} = req.body;
     
     const user = await User.findOne({email});
     
     if(!user)
     {
        return res.json({message: "User not found"});
     }

     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch)
     {
        return res.json({message: "passwords dont match"});
     }
     
     const acessToken = generateAccessToken(user);
     const refreshToken = generateRefreshToken(user);

     user.refreshToken = refreshToken;

     await user.save();
     
     res.cookie('refreshToken', refreshToken , {httpOnly: true, secure: true, sameSite: 'Strict'});
     
     res.json({
        acessToken, 
        user: { id: user._id, username: user.username, email: user.email }
    });
    
    
    
} catch (error) {
    res.json({message: "error while logging in"});
}

})

//Writing protected routes here 

router.get("/profile",authMiddle,async (req,res)=>
{
    try {
        const user = await User.findOne(req.user._id).select('-password');
        res.json({message: "user found successfull"});
    } catch (error) {
        res.json({message:"some error occured while loading the profile"});
    }

})

//refresh token endpoint 

router.post("/refresh", async(req,res)=> 
{
   try {
     const refreshToken = req.cookies.refreshToken;
     if(!refreshToken)
     {
        return res.json({message: "no token found"});
     }
     
     const user = User.findOne({refreshToken});
 
     if(!user)
     {
        return res.json({message: "no user found with this refresh token"});
     }
     
     jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err,code)=>  {
         if (err) return res.json({message: "invalid token"});
         
         const newAccessToken = generateAccessToken(user);
 
         res.json({accessToken: newAccessToken });
     });
     
   } catch (error) {
      res.json("there was an error");
   }
     

}) 

router.post("/logout",async (req,res)=> 
{
   try {
    const user = await User.findOneAndUpdate(
        { refreshToken: req.cookies.refreshToken },
        { refreshToken: null },
        { new: true } // Optional: Returns the updated user
    );
    
    if (!user) return res.json({ message: "User not found" });
     res.clearCookie('refreshToken',{httpOnly: true, secure: true, sameSite:'Strict'});
     res.json({message : "logged out successfully"});
 
   } catch (error) {
       res.json({message: "an error occured while logging out"});

   }



})

export default router;