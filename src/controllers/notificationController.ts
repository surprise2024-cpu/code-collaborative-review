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

        const userId = Number(req.params.id);

        if (Number.isNaN(userId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });

        }

        // users may only view their own notifications
        if (req.user?.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view these notifications'
            });
        }

        const result = await pool.query(
            `SELECT
                id,
                user_id,
                message,
                type,
                created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY s.created_at DESC`,
            [userId]

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