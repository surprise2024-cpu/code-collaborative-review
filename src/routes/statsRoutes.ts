import { 
    Router 
} from "express";

import { 
    authenticateToken 
} from "../middleware/authMiddleware.js";

import { 
    getProjectStats 
} from "../controllers/statsController.js";

const router = Router();

router.get(
    '/projects/:id/stats',
    authenticateToken,
    getProjectStats
);

export default router;