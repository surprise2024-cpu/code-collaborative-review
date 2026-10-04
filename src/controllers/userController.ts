import pool from "../config/database.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import type { Response } from "express";

export async function getProfile(
    req: AuthRequest,
    res: Response
) {

    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {

        return res.status(400).json({
            success: false,
            message: 'Invalid user ID'
        });

    }

    if (req.user?.id !== userId) {

        return res.status(403).json({
            success: false,
            message: 'You cannot access this profile'
        });

    }
    
    try {
        const result = await pool.query(
            `SELECT 
                id, 
                name, 
                email, 
                role,
                display_picture,
                created_at
            FROM users 
            WHERE id = $1`,
            [userId]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });

        }

        return res.status(200).json({
            success: true,
            user: result.rows[0]
        });
        
    } 
    catch (error) {

        console.error('Error fetching user profile:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}

export async function updateProfile(
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

    if (req.user?.id !== userId) {

        return res.status(403).json({
            success: false,
            message: 'You cannot access this profile'
        });

    }

        const { 
            name, 
            email, 
            display_picture 
        } = req.body;

        if (!name || !email) {

            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });

        }

        const result = await pool.query(
            `UPDATE users 
            SET 
                name = $1, 
                email = $2, 
                display_picture = $3 
            WHERE id = $4 
            RETURNING 
                id, 
                name, 
                email, 
                display_picture`,
            [name, email, display_picture, userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    }
    catch (error) {
        
        console.error('Error updating user profile:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}

export async function deleteProfile(
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

        if (req.user?.id !== userId) {

            return res.status(403).json({
                success: false,
                message: 'You cannot delete this profile'
            });

        }

        const result = await pool.query(
            `DELETE FROM users
            WHERE id = $1
            RETURNING id`,
            [userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });

        }

        return res.status(200).json({
            success: true,
            message: 'Profile deleted successfully'
        });

    }
    catch (error) {

        console.error('Error deleting user profile:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}