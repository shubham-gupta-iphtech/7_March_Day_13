import jwt from "jsonwebtoken";

const authMiddle = (req,res,next) => 
{
    const token = req.header('Authorization');
    console.log(token);
    if(!token) 
    {
        return res.json({message: "access denied"});
    }
    
    try
    {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();

    }
    catch(error)
    {
        res.json({message: "there was an error in token validation."});
    }


}

export default authMiddle;

