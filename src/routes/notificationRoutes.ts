import { 
    Router 
} from "express";

import {
    getNotifications
} from '../controllers/notificationController.js';

import { 
    authenticateToken
} from "../middleware/authMiddleware.js";

const router = Router();

router.get(
    '/users/:id/notifications', 
    authenticateToken,
    getNotifications
);

export default router;
