import express from "express"
import { signup,login,logout,getMe } from "../controllers/auth.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router()

router.post('/signup',signup) // signup function imported from auth.controller.js file
router.post('/login',login) 
router.post('/logout',logout) 
router.get('/me', protectRoute ,getMe) // to check whether the user is in DB



export default router;