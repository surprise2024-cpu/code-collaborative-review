import { Router } from "express";
import { createSubmission } from "../controllers/submissionController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.post(
    '/projects/:projectId/submissions',
    authenticateToken,
    authorizeRoles('submitter'),
    createSubmission
);

export default router;