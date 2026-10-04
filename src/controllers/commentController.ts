import type { Response } from "express";

import pool from '../config/database.js';

import type { AuthRequest } from "../middleware/authMiddleware.js";

export async function createComment(
    req: AuthRequest,
    res: Response
) {

    try {

        const submissionId = Number(req.params.id);

        const { content, line_number } = req.body;

        if (Number.isNaN(submissionId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });
        }

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        if ( 
            line_number !== undefined && 
            line_number !== null && 
            (
                !Number.isInteger(line_number) ||
                line_number <= 0
            )
        ) {

            return res.status(400).json({
                success: false,
                message: 'Line number must be a positive integer'
            });

        }

        const access = await pool.query(
            `SELECT 
                s.id,
                s.submitter_id
            FROM submissions s
            JOIN project_members pm
                ON s.project_id = pm.project_id
            WHERE 
                s.id = $1
            AND pm.user_id = $2`,
            [submissionId, req.user?.id]

        );

        if (access.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message: 'You cannot comment on this submission'
            });

        }

        const result = await pool.query(
            `INSERT INTO comments 
                (submission_id, reviewer_id, content, line_number) 
            VALUES 
                ($1, $2, $3, $4) 
            RETURNING 
                id, 
                submission_id, 
                reviewer_id,
                content, 
                line_number, 
                created_at`,
            [submissionId, req.user?.id, content.trim(), line_number ?? null]
        );

        return res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: result.rows[0]
        });

    }
    catch (error) {

        console.error('Error creating comment:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}

export async function getSubmissionComments(
    req: AuthRequest,
    res: Response
) {
    try {   

        const submissionId = Number(req.params.id);
        const userId = req.user?.id;

        if (Number.isNaN(submissionId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });

        }
        
        // check whether user can access the submission
        const access = await pool.query(
            `SELECT s.id 

            FROM submission s

            JOIN projects p 
                ON s.project_id = p.id

            LEFT JOIN project_members pm
                ON p.id = pm.project_id

            WHERE s.id = $1 

            AND (
                p.created_by = $2 
                OR pm.user_id = $2
            )`,
            [submissionId, userId]
        );

        if (access.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message: 'You do not have access to this submission'
            });

        }

        const result = await pool.query(
            `SELECT 
                c.id,
                c.submission_id,
                c.reviewer_id,
                u.name AS reviewer_name,
                c.content,
                c.line_number,
                c.created_at,
                c.updated_at
            FROM comments c
            JOIN users u 
                ON c.reviewer_id = u.id
            WHERE c.submission_id = $1
            ORDER BY c.created_at ASC`,
            [submissionId]
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {

        console.error('Error fetching comments: ', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}

export async function updateComment(
    req: AuthRequest,
    res: Response
) {

    try {

        const commentId = Number(req.params.id);
        const { content, line_number } = req.body;

        if (Number.isNaN(commentId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid comment ID'
            });

        }

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });

        }

        if (
            line_number !== undefined &&
            line_number !== null &&
            (
                !Number.isInteger(line_number) ||
                line_number <= 0
            )
        ) {

            return res.status(400).json({
                success: false,
                message: 'Line number must be a positive integer'
            });

        }

        const result = await pool.query(
            `UPDATE comments
            SET
                content = $1,
                line_number = $2,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $3
            AND reviewer_id = $4

            RETURNING
                id,
                submission_id,
                reviewer_id,
                content,
                line_number,
                created_at,
                updated_at`,
            [
                content.trim(),
                line_number ?? null,
                commentId,
                req.user?.id
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });

        }

        return res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: result.rows[0]
        });

    }
    catch (error) {

        console.error('Error updating comment:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}

export async function deleteComment(
    req: AuthRequest,
    res: Response
) {

    try {

        const commentId = Number(req.params.id);

        if (Number.isNaN(commentId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid comment ID'
            });

        }

        const result = await pool.query(
            `DELETE FROM comments

            WHERE id = $1
            AND reviewer_id = $2

            RETURNING id`,
            [commentId, req.user?.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });

        }

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });

    }
    catch (error) {

        console.error('Error deleting comment:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}