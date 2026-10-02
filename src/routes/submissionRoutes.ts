import { 
    Router 
} from "express";

import { 
    createSubmission, 
    getProjectSubmissions, 
    getSubmissionById,
    updateSubmission,
    deleteSubmission
} from "../controllers/submissionController.js";

import { 
    authenticateToken, 
    authorizeRoles 
} from "../middleware/authMiddleware.js";

const router = Router();

router.post(
    '/projects/:projectId/submissions',
    authenticateToken,
    authorizeRoles('submitter'),
    createSubmission
);

router.get(
    '/projects/:projectId/submissions',
    authenticateToken,
    getProjectSubmissions
);

router.get(
    '/submissions/:id',
    authenticateToken,
    getSubmissionById
);

router.put(
    '/submissions/:id',
    authenticateToken,
    authorizeRoles('submitter'),
    updateSubmission
);

router.delete(
    '/submissions/:id',
    authenticateToken,
    authorizeRoles('submitter'),
    deleteSubmission
);

export default router;