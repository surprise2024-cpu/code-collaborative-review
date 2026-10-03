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
    '/submissions/:id/status',
    authenticateToken,
    authorizeRoles('reviewer'),
    updateReviewStatus
);

router.get(
    '/submissions/:id/history',
    authenticateToken,
    getReviewHistory
);

export default router;