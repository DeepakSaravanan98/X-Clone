import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js';

export const signup =async(req,res)=>{
    try {
        const  {username , fullName , email , password } = req.body ; //all the info entered while signup will be in the body section of the request
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Invalid mail type"})
        }

        const existingEmail = await User.findOne({email}) // checking if the email is already present
        const existingUser = await User.findOne({username})

        if (existingEmail || existingUser){
            return res.status(400).json({error:"Already existing user or email"})
        }

        if(password.length < 6){
            return res.status(400).json({error:"password must be more than 6"})
        }
        
        //hashing the password
        //eg:123456=pjpm0j540f

        const salt = await bcrypt.genSalt(10) //hashes password 10times so it gives a strong string
        const hashedPassword = await bcrypt.hash(password,salt) // stores the hashed password

        const newUser = new User({
            username,
            fullName,                     //stores the received data into the model
            email,
            password : hashedPassword,
        })

        if(newUser){        // if new user is created
            generateToken(newUser._id, res)
            await newUser.save()  //saves the data in mongoDB
            res.status(200).json({
                _id:newUser._id,
                username:newUser.username,
                fullName:newUser.fullName,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg,
                bio:newUser.bio,
                link:newUser.link,
            })
        }else{
            res.status(400).json({error : "Invalid user data"})
        }

    } catch (error) {
        console.log(`Signup error in ${error}`)
        res.status(500).json({error : "internal server error"}) // 500-internal server error
    }
}

export const login = async (req,res)=>{
    try {
        const{ username , password }= req.body;
        const user = await User.findOne({username}); // checking if user is available in mongodb
        const isPasswordCorrect = await bcrypt.compare( password , user?.password || "") // comparing entered password with password in mongoDB
    
        if( !user || ! isPasswordCorrect ){ // if username or password does not match
            return res.status(400).json({ error : "Invalid username or password"})
        }

        generateToken( user._id , res);
        
        res.status(200).json({
            _id:user._id,
                username:user.username,
                fullName:user.fullName,
                email:user.email,
                followers:user.followers,
                following:user.following,
                profileImg:user.profileImg,
                coverImg:user.coverImg,
                bio:user.bio,
                link:user.link,
        })

    } catch (error) {
        console.log(`error in login controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}

export const logout = async(req,res) =>{
    try {
        res.cookie("jwt", "" , { maxAge : 0}) // creating the token and deleting it immediately
        res.status(200).json({ message : "Logout successfully"})
    } catch (error) {
        console.log(`error in logout controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}

export const getMe = async(req,res) =>{ // to check whether the user is present or not in DB
    try {
        const user = await User.findOne({ _id : req.user._id }).select("-password") // getting the encrypted ID from the cookie and decode it to check
        res.status(200).json(user);
    } catch (error) {
        console.log(`error in getMe controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}