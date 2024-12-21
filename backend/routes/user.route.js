import express from 'express'
import protectRoute from '../middleware/protectRoute.js'; // protectroute is mainly used for security purpose and to get the id of the user
                                                        // who is currently loggedin
import { getProfile,followUnFollowUser,getSuggestedUsers,updateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/profile/:username",protectRoute,getProfile) // if we give a particular username in path it will fetch and provide the details
router.post("/follow/:id",protectRoute,followUnFollowUser)
router.get("/suggested",protectRoute,getSuggestedUsers)
router.post("/update",protectRoute,updateUser)

export default router;