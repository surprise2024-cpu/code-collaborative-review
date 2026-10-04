import { 
    Router 
} from "express";

import { 
    createComment,
    getSubmissionComments,
    updateComment,
    deleteComment
} from "../controllers/commentController.js";

import { 
    authenticateToken, 
    authorizeRoles 
} from "../middleware/authMiddleware.js";

const router = Router();

router.post(
    '/submissions/:id/comments',
    authenticateToken,
    authorizeRoles('reviewer'),
    createComment
);

router.get(
    '/submissions/:id/comments',
    authenticateToken,
    getSubmissionComments
);

router.put(
    '/comments/:id',
    authenticateToken,
    authorizeRoles('reviewer'),
    updateComment
);

router.delete(
    '/comments/:id',
    authenticateToken,
    authorizeRoles('reviewer'),
    deleteComment
);

export default router;