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