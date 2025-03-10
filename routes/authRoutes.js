import express from "express"
import User from '../models/user.js'
import authMiddle from "../middlewares/authMiddleware.js";
const router = express.Router();
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


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
        res.json({message: "User not found"});
     }
     
     console.log(password);
      console.log("user found",user);

     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch)
     {
        res.json({message: "passwords dont match"});
     }
     
     const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn: '1h'});
     res.json({
        token, 
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




export default router;