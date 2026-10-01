import { 
    Router 
} from "express";

import { 
    createProject, 
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from "../controllers/projectController.js";

import { 
    authenticateToken 
} from "../middleware/authMiddleware.js";

import { 
    addProjectMember 
} from "../controllers/projectMemberController.js";

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

router.put(
    '/:id',
    authenticateToken,
    updateProject
);

router.delete(
    '/:id',
    authenticateToken,
    deleteProject
);

router.post(
    '/:id/members',
    authenticateToken,
    addProjectMember
);

export default router;