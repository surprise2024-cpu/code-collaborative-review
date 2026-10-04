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
                ON p.id = pm.project_id
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
                )::int AS in_review,
                
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

        // calculate the average review time
        const averageReviewTimeResult = await pool.query(
            `SELECT
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (rh.created_at - s.created_at)) / 60
                    )::numeric,
                    2
                ) AS average_review_time_minutes

            FROM review_history rh

            JOIN submissions s
                ON rh.submission_id = s.id

            WHERE s.project_id = $1
            AND rh.new_status IN ('approved', 'changes_requested')`,
            [projectId]
        );


        // calculate approved vs changes requested percentages
        const percentageResult = await pool.query(
            `SELECT
                ROUND(
                    (
                        COUNT(*) FILTER (
                            WHERE status = 'approved'
                        )::numeric
                        /
                        NULLIF(
                            COUNT(*) FILTER (
                                WHERE status IN (
                                    'approved',
                                    'changes_requested'
                                )
                            ),
                            0
                        )
                    ) * 100,
                    2
                ) AS approved_percentage,

                ROUND(
                    (
                        COUNT(*) FILTER (
                            WHERE status = 'changes_requested'
                        )::numeric
                        /
                        NULLIF(
                            COUNT(*) FILTER (
                                WHERE status IN (
                                    'approved',
                                    'changes_requested'
                                )
                            ),
                            0
                        )
                    ) * 100,
                    2
                ) AS changes_requested_percentage

            FROM submissions

            WHERE project_id = $1`,
            [projectId]
        );


        // show how active each reviewer is
        const reviewerActivityResult = await pool.query(
            `SELECT
                u.id AS reviewer_id,
                u.name AS reviewer_name,
                COUNT(rh.id)::int AS review_actions

            FROM review_history rh

            JOIN submissions s
                ON rh.submission_id = s.id

            JOIN users u
                ON rh.reviewer_id = u.id

            WHERE s.project_id = $1

            GROUP BY
                u.id,
                u.name

            ORDER BY review_actions DESC`,
            [projectId]
        );


        // find the submission with the most comments
        const mostCommentedResult = await pool.query(
            `SELECT
                s.id AS submission_id,
                s.title,
                COUNT(c.id)::int AS comment_count

            FROM submissions s

            LEFT JOIN comments c
                ON s.id = c.submission_id

            WHERE s.project_id = $1

            GROUP BY
                s.id,
                s.title

            ORDER BY comment_count DESC

            LIMIT 1`,
            [projectId]
        );

        return res.status(200).json({
            success: true,
            data: {

                // basic project statistics
                ...submissionResult.rows[0],

                total_comments:
                    commentResult.rows[0].total_comments,

                
                average_review_time_minutes:
                    averageReviewTimeResult.rows[0].average_review_time_minutes,

                approved_percentage:
                    percentageResult.rows[0].approved_percentage,

                changes_requested_percentage:
                    percentageResult.rows[0].changes_requested_percentage,

                reviewer_activity:
                    reviewerActivityResult.rows,

                most_commented_submission:
                    mostCommentedResult.rows[0] ?? null

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