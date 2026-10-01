import { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/database.js";
import type { Response } from "express";


export async function addProjectMember(
    req: AuthRequest,
    res: Response
) {
    try {

        const projectId = Number(req.params.id);
        const { userId } = req.body;

        if (Number.isNaN(projectId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });

        }

        if (!userId) {

            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // make sure the logged in user owns the project
        const project = await pool.query(

            `SELECT id 
            FROM projects 
            WHERE id = $1 
            AND created_by = $2`,
            [projectId, req.user?.id]
        );

        if (project.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });

        }

        // make sure the user exists and is a reviewer
        const user = await pool.query(

            `SELECT 
                id,
                name,
                email, 
                role
            FROM users 
            WHERE id = $1`,
            [userId]
        );

        if (user.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });

        }

        if (user.rows[0].role !== 'reviewer') {

            return res.status(400).json({
                success: false,
                message: 'Only reviewers have access to this resource'
            });

        }

        // add reviewer to project
        const result = await pool.query(
            `INSERT INTO project_members 
                (project_id, user_id)
            VALUES ($1, $2)
            RETURNING 
                id,
                project_id,
                user_id,
                created_at`,
            [projectId, userId]

        );

        return res.status(201).json({
            success: true,
            message: 'Project member added successfully',
            data: result.rows[0]
        });
  

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Error adding project member'
        });
    }
}