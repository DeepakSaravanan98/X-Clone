import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    fullName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minLength : 6
    },
    followers : [
        {
            type : mongoose.Schema.Types.ObjectId, //pushing the user who already has an id into the followers array
            ref : "User",
            default : [] //empty array as default 
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId, //pushing the user who already has an id into the followers array
            ref : "User",
            default : [] //empty array as default 
        }
    ],
    profileImg :{
        type : String, //after uploading images in cloudinary it will provide a string for the image we will use it here
        default : ""
    },
    coverImg :{
        type : String, 
        default : ""
    },
    bio :{
        type : String, 
        default : ""
    },
    link :{
        type : String, 
        default : ""
    },
    likedPosts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Post",                            // contains the id of the posts this
            def : [],                                 //    user has like in an array
        }
    ],
},{timestamps : true/*mongodb will provide two values for creating and modifying time*/})

const User = mongoose.model("User",userSchema) //collection is "User" and use the schem userSchema
export default User;