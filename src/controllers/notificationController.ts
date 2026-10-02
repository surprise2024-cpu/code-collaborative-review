import pool from "../config/database.js";

import type { 
    Response 
} from "express";

import type { 
    AuthRequest 
} from "../middleware/authMiddleware.js";

export async function getNotifications(
    req: AuthRequest,
    res: Response
) {

    try {

        const result = await pool.query(
            `SELECT
                id,
                message,
                type,
                is_read,
                created_at
            FROM notification
            WHERE user_id = $1
            ORDER BY s.created_at DESC`,
            [req.user?.id]

        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    }
    catch (error) {

        console.error('Error in retrieving notification', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }
    
}

export async function markNotificationAsRead(
    req: AuthRequest,
    res: Response
) {

    try {
        const notificationId = Number(req.params.id);

        if (Number.isNaN(notificationId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid notification ID'
            });

        }

        const result = await pool.query(
            `UPDATE notifications
                SET is_read = TRUE
            WHERE 
                id = $1
            AND user_id = $2 
            RETURNING 
                id, 
                useer_id, 
                message, 
                type, 
                is_read, 
                created_at`,
            [notificationId, req.user?.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Notifications unavailable'
            });

        }

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: result.rows[0]
        });

    }
    catch (error) {

        console.error('Error in marking notification as read', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }
}