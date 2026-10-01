import { Router } from "express";
import { createProject, getProjects } from "../controllers/projectController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post(
    '/',
    authenticateToken, 
    createProject
);

router.get(
    '/',
    authenticateToken,
    getProjects
);

export default router;