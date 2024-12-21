import jwt from "jsonwebtoken"
import User from "../models/user.model.js";

const protectRoute = async( req, res, next )=>{ // next is for to go for the next function 
    try {
        const token = req.cookies.jwt;//provides the cookie named jwt

        if(!token){
            return res.status(400).json({ error : "unauthorized : no token provided"})
        }
        
        // decoding the token

        const decoded = jwt.verify( token , process.env.JWT_SECRET) //compares and checks whether the cookie came from the browser contains our secret key
    
        if(!decoded){
            return res.status(400).json({ error : "unauthorized : Invalid token"})
        }

        //checking whether our userid is present in decoded cookie
        const user = await User.findById(decoded.userId).select("-password") //returns every details with matched user id except password
        
        if(!user){
            return res.status(400).json({ error : "User not found"})
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(`error in protectRoute controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}

export default protectRoute;