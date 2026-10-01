import { Router } from "express";
import { createProject } from "../controllers/projectController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";



const router = Router();

router.post(
    '/',
    authenticateToken, 
    createProject
);

export default router;