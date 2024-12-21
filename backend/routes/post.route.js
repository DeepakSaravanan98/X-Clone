import express from "express"
import protectRoute from "../middleware/protectRoute.js";
import { createPost,deletePost,createComment,likeUnLikePost,getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts, } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all",protectRoute,getAllPosts)
router.get("/likes/:id",protectRoute,getLikedPosts)
router.get("/user/:username",protectRoute,getUserPosts)
router.get("/following",protectRoute,getFollowingPosts)
router.post("/create",protectRoute,createPost)
router.post("/like/:id",protectRoute,likeUnLikePost)
router.post("/comment/:id",protectRoute,createComment)
router.delete("/:id",protectRoute,deletePost) // passing the id of the post not the userid

export default router;