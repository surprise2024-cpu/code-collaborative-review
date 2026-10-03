import type {
    Response
} from 'express';

import pool from '../config/database.js';

import type { 
    AuthRequest 
} from '../middleware/authMiddleware.js';

export async function getProjectStats(
    req: AuthRequest,
    res: Response
) {

    try {

        const projectId = Number(req.params.id);
        const userId = req.user?.id;

        if (Number.isNaN(projectId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });

        }

        // check that the user belongs to the project
        const accessResult = await pool.query(
            `SELECT p.id
            FROM projects p
            LEFT JOIN project_members pm
                ON p.id = pm.projectz_id
            WHERE p.id = $1
            AND (
            p.created_by = $2
            OR pm.user_id = $2
            )`,
            [projectId, userId]
        );

        if (accessResult.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message: 'You do not have access to this project'
            });

        }

        // count submissions by status
        const submissionResult = await pool.query(
            `SELECT
                COUNT(*)::int AS total_submissions,

                COUNT(*) FILTER (
                    WHERE status = 'pending'
                )::int AS pending,
                
                COUNT(*) FILTER (
                    WHERE status = 'in_review'
                )::int AS in_review
                
                COUNT(*) FILTER (
                    WHERE status = 'approved'
                )::int AS approved,
                
                COUNT(*) FILTER (
                    WHERE status = 'changes_requested'
                )::int AS changes_requested
            
            FROM submissions
            
            WHERE project_id = $1`,
            [projectId]

        );

        // count all comments belonging to the project's submissions
        const commentResult = await pool.query(

            `SELECT
                COUNT(c.id)::int AS total_comments
                
            FROM comments c
            
            JOIN submissions s
                ON c.submission_id = s.id
                
            WHERE s.project_id = $1`,
            [projectId]

        );

        return res.status(200).json({
            success: true,
            data: {
                ...submissionResult.rows[0],
                total_comments:
                    commentResult.rows[0].total_comments
            }

        });

    }
    catch (error) {

        console.error('Error in retrieving project stats: ', error);
    
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}