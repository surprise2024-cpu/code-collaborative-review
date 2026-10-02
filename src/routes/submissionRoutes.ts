import { Router } from "express";
import { createSubmission, getProjectSubmissions, getSubmissionById } from "../controllers/submissionController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

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

export default router;