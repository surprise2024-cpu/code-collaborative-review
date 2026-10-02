import { 
    Router 
} from "express";

import { 
    updateReviewStatus 
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

export default router;