import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";



const router = Router();

router.get(
    '/profile', 
    authenticateToken, 
    getProfile
);

router.put(
    '/profile', 
    authenticateToken, 
    updateProfile
);

export default router;