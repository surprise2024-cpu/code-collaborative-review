import { 
    Request,
    Response,
    NextFunction,
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

router.post(
    '/submissions/:id/approve',
    authenticateToken,
    authorizeRoles('reviewer'),
    (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        req.body = {
            ...(req.body ?? {}),
            status: 'approved'
        };

        next();
    },

    updateReviewStatus

);

router.post(
    '/submissions/:id/approve',
    authenticateToken,
    authorizeRoles('reviewer'),
    (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        req.body = {
            ...(req.body ?? {}),
            status: 'approved'
        };
        
        next();
    },

    updateReviewStatus

);

router.get(
    '/submissions/:id/history',
    authenticateToken,
    getReviewHistory
);

router.get(
    '/submissions/:id/reviews',
    authenticateToken,
    getReviewHistory
);

export default router;