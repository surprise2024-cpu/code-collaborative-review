import { Router } from "express";
import { createComment } from "../controllers/commentController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.post(
    '/submissions/:submissionId/comments',
    authenticateToken,
    authorizeRoles('reviewer'),
    createComment
);

export default router;