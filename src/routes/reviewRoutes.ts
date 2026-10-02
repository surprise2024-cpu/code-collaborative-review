import { 
    Router 
} from "express";

import { 
    updateReviewStatus,
    getReviewHistory 
} from "../controllers/reviewController.js";

import { 
    authenticateToken, 
    authorizeRoles 
} from "../middleware/authMiddleware.js";

const router = Router();

router.patch(
    '/submissons/:id/status',
    authenticateToken,
    authorizeRoles('reviewer'),
    updateReviewStatus
);

router.get(
    '/submissons/:id/history',
    authenticateToken,
    getReviewHistory
);

export default router;