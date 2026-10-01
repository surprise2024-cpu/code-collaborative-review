import { Router } from "express";

import { 
    createProject, 
    getProjects,
    getProjectById
} from "../controllers/projectController.js";

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

router.get(
    '/:id',
    authenticateToken,
    getProjectById
);

export default router;