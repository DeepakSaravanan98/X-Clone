import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import cloudinary from "cloudinary"

export const getProfile = async (req,res)=>{
    try {
        const {username} = req.params; // stores the username from the link/path provided in the route
        const user = await User.findOne({username})

        if(!user){
            return res.status(404).json({ error : "user not found"})
        }  
        
        res.status(200).json(user);
        

    } catch (error) {
        console.log(`error in user profile controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}

export const followUnFollowUser = async (req,res) =>{
    try {
        const {id} = req.params; // getting the id from the request which we want to follow or unfollow
        const userToModify = await User.findById({ _id : id}) // finding the id
        const currentUser = await User.findById({ _id : req.user._id}) // protectroute function contains the user id from the decoded token we are using that id
                                                                       // that is our id
        if ( id === req.user._id){
            return res.status(400).json({ error : "you can't follow or unfollow yourself"})
        }

        if( !userToModify || !currentUser ){
            return res.status(404).json({ error : "user not found"})
        }

        /* we are checking if the usertomodify is already following the current user by checking the
        checking the current user following arrays */

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow
            //removing our id from his followers list
            await User.findByIdAndUpdate({_id : id},{$pull : {followers : req.user._id}})
            //removing his id from our followers list
            await User.findByIdAndUpdate({_id : req.user._id},{$pull : {following : id}})
            res.status(200).json({ message : "unfollow successfully"})
        }else{
            //follow
            //pushing our id into his followers list
            await User.findByIdAndUpdate({_id : id},{$push : {followers : req.user._id}})
            //pushing his id into our following list
            await User.findByIdAndUpdate({_id : req.user._id},{$push : {following : id}})
            //send notification
            const newNotification = new Notification({
                type : "follow", // we are following
                from : req.user._id, // our id
                to : userToModify._id // who we follow
            })
            await newNotification.save();
            res.status(200).json({ message : "follow successfully"})
        }

    } catch (error) {
        console.log(`error in followUnfollow controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}

export const getSuggestedUsers = async(req,res)=>{
    try {
        const userId = req.user._id;
        /* suggested users should be whom the user has not followed till,so for that
           first we are finding who he has followed */
        const userFollowedByMe = await User.findById({_id:userId}).select("-password")

        const users = await User.aggregate([
            {
                $match : {
                    _id : { $ne : userId} //suggested users should not contain the logged in 
                                          // userid   ne=not equal
                }
            },
            {
                $sample : {
                    size : 10  // take 10 random users
                }
            }
        ])

        /* so the above users array contains 10 users other than me, so from the 10 users
           we have to filter the users who are not followed by me*/

        const filteredUser = users.filter((user)=> !userFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUser.slice(0,4); // taking 4 users from filtereduser array

        /* the suggestedusers will contain every detail of the user ,from that we have to hide the
           password so we are making it null */
           
        suggestedUsers.forEach((user)=>(user.password = null))   
        res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log(`error in getSuggestedUsers controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}

export const updateUser = async (req,res)=>{
    try {
        const userId = req.user._id; // current user id
        const { username, fullName, email, currentPassword, newPassword, bio, link}=req.body;
        let { profileImg,coverImg } = req.body;

        let user = await User.findById({_id:userId})

        if(!user){
            return res.status(404).json({ error :"user not found"})
        }

        // we need both current password and new password

        if((!currentPassword && newPassword) || (!newPassword && currentPassword)){
            return res.status(400).json({ error :"we need both current and new password to update"})
        }

        if(currentPassword && newPassword){
            /*comparing the current password and the hashed password in mongodb is matching*/
            const isMatch = await bcrypt.compare(currentPassword,user.password)

            if(!isMatch){
                return res.status(400).json({ error :"current password is incorrect"})
            }
            
            //chencking new pasword length
            if(newPassword.length < 6){
                return res.status(400).json({ error :"password must have atleast 6 chars"})
            }
            
            //hashing the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword,salt);
        }
        
        if(profileImg){

            /* if user already contains the profile img we are deleting the old image and 
               uploading the new one in cloudinary */
            if(user.profileImg){
               await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }    
            const uploadedResponse = await cloudinary.uploader.upload(profileImg) // uploading our profile img in clodinary
            // the uploadedresponse will contain the uploaded image as a string in secure_url 
           profileImg = uploadedResponse.secure_url; 
        }

        if(coverImg){

           if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg) // uploading our profile img in clodinary
            // the uploadedresponse will contain the uploaded image as a string in secure_url 
            coverImg = uploadedResponse.secure_url; 
        }

        /* if the user request contains username,fullname.... to change we change it or let 
        it be same */

        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save(); // saving the updated info

        //password is response in null as it is confidential
        user.password = null;
        return res.status(200).json(user);

    } catch (error) {
        console.log(`error in updateUser controller : ${error}`)
        res.status(500).json({error:"Internal server error"})
    }
}