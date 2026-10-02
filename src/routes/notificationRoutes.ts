import { Router } from "express";

import {
    getNotifications,
    markNotificationAsRead
} from '../controllers/notificationController.js';

import { 
    authenticateToken
} from "../middleware/authMiddleware.js";

const router = Router();

router.get(
    '/', 
    authenticateToken,
    getNotifications
);

router.patch(
    '/:id/read', 
    authenticateToken,
    markNotificationAsRead
);

export default router;
