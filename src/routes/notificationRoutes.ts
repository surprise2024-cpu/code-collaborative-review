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
    '/register', 
    authenticateToken,
    getNotifications
);

router.patch(
    '/login', 
    authenticateToken,
    markNotificationAsRead
);

export default router;
