import User from "../models/user.model.js";
import cloudinary from "cloudinary"
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";


export const createPost = async (req,res) =>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString(); // it will be in json format

        const user = await User.findOne({_id : userId})
        
        if (!user){
            return res.status(404).json({error : "user not found"})
        }

        //the comment should contain either text or image or both but not empty
        if(!text && !img){
            return res.status(400).json({error:"post must have text or image"})
        }

        if(img){
            //uploading img in cloudinary
            const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user:userId,
            text,
            img
        })

        await newPost.save();
        res.status(201).json(newPost)

    } catch (error) {
        console.log(`Error in createPost controller :${error}`)
        res.status(500).json({error : "internal server error"})
    }
}

export const deletePost = async (req,res) =>{
    try {
        const {id} = req.params; //getting id of the post
        
        //checking whether the post is present
        const post = await Post.findOne({_id:id});

        if(!post){
            return res.status(404).json({error : "Post not found"})
        }
        
        /*if the id of the user in the post does not match with the currently logged in user 
          who sent the request bcoz one user should not delete other users post */
        
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error : "You are not authorized to delete this post"})
        }

        if(post.img){
            //deleting the img in cloudinary

            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete({_id : id})

        res.status(200).json({message : "post deleted successfully"})

    } catch (error) {
        console.log(`Error in deletePost controller :${error}`)
        res.status(500).json({error : "internal server error"})
    }
}

export const createComment = async (req,res) =>{
    try {
        const {text} = req.body
        const postId = req.params.id
        const userId = req.user._id

        if(!text){
            return res.status(404).json({error : "comment text not found"})
        }

        //getting the post
        const post = await Post.findOne({_id : postId})

        if(!post){
            return res.status(404).json({error : "post not found"})
        }

        const comment = {
            user : userId,
            text
        }

        //pushing the comment in the comments array in the Post model
        post.comments.push(comment)
        await post.save()
        res.status(200).json(post)

    } catch (error) {
        console.log(`Error in createComment controller :${error}`)
        res.status(500).json({error : "internal server error"})
    }
}

export const likeUnLikePost = async (req,res)=>{
    try {
        const userId = req.user._id;
        const postId = req.params.id;

        //getting the post
        const post = await Post.findOne({_id : postId})

        if(!post){
            return res.status(404).json({error : "post not found"})
        }

        //checking whether the user has already liked the post

        const userLikedPost = post.likes.includes(userId)

        if(userLikedPost){
            //unlike the post
            await Post.updateOne({_id:postId},{$pull : {likes : userId}})

            //removing the postid in the likedposts array in the user model
            await User.updateOne({_id:userId},{$pull:{likedPosts : postId}})

            //removing the likes from the likes array using filter
            const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString())

            res.status(200).json(updatedLikes)
        }else{
            //like the post
            post.likes.push(userId);
            await User.updateOne({_id:userId},{$push:{likedPosts : postId}})
            await post.save()
        

        const notification = new Notification({
            from:userId,
            to : post.user, // owner of the post ; refer post model
            type : "like"
        })

        await notification.save();

        const updatedLikes = post.likes;
        res.status(200).json(updatedLikes)
        }
    } catch (error) {
        console.log(`Error in likeUnlikePost controller :${error}`)
        res.status(500).json({error : "internal server error"})
    }
}


export const getAllPosts = async(req,res)=>{
    try {
        // we must show the posts as in recently posted order so we are sorting reverse
        const posts = await Post.find().sort({createdAt:-1}).populate({
            path : "user",
            select : "-password"
        })
        .populate({
            path : "comments.user",
            select : ["-password","-email","-following","-followers","-bio","-link"]
        })

        /* if no posts are present we are responding with an empty array as we are going
           to display our posts with map function in frontend */
        
           if(posts.length === 0){
            return res.status(200).json([])
           }

        await res.status(200).json(posts)  

    } catch (error) {
        console.log(`Error in getAllPosts controller :${error}`)
        res.status(500).json({error : "internal server error"})
    }
}

export const getLikedPosts = async(req,res)=>{
    const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

        /* getting all the posts the user has liked and storing it in the liked posts
             array */
		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const getFollowingPosts = async(req,res) =>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error : "User not found"})
        }

        // here we are showing all the posts posted by the people he is follwoing
        // 1st we are getting the following list from the user model

        const following = user.following;

        /* next,now we have the following ids so now we are going to compare that ids and 
           the posts which also have the same ids and store it in a variable */

        const feedPosts = await Post.find({user : {$in :following}})
                             .sort({createdAt:-1})
                             .populate({
                                path: "user",
                                select: "-password",
                            })
                            .populate({
                                path: "comments.user",
                                select: "-password",
                            });

        res.status(200).json(feedPosts);

    } catch (error) {
        console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}

export const getUserPosts = async(req,res) =>{
    try {
        const {username}=req.params;
        const user = await User.findOne({username})
        if(!user){
            return res.status(404).json({error : "User not found"})
        }

        /* this controller is for to find all the posts posted by the particular user */

        const posts = await Post.find({user : user._id})
                       .sort({createdAt : -1})
                       .populate({
                        path: "user",
                        select: "-password",
                    })
                    .populate({
                        path: "comments.user",
                        select: "-password",
                    });

        res.status(200).json(posts)

    } catch (error) {
        console.log("Error in getUserName controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}