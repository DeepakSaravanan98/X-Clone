import jwt from "jsonwebtoken"

const generateToken=(userId,res)=>{ //collecting the userid and res sent from auth controller
    const token = jwt.sign({ userId },process.env.JWT_SECRET /*secret key from env file*/,{
        expiresIn:"15d" // the token will be stored in webbrrowser for 15days
    })

    res.cookie("jwt" , token , {
        maxAge : 15*24*60*1000, //15days in values
        httponly : true, //only http requests and prevents XSS attacks
        samesite : "strict", //CSRF attacks
        secure : process.env.NODE_ENV !== "development" //secure is OFF during development and ON during production
    })
}

export default generateToken;