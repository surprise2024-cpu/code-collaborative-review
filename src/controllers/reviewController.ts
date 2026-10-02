import { 
    AuthRequest 
} from "../middleware/authMiddleware.js";

import pool from "../config/database.js";

import type { 
    Response 
} from "express";

import { 
    createNotification 
} from "../utils/notification.js";

export async function updateReviewStatus(
    req: AuthRequest,
    res: Response
) {

    const client = await pool.connect();

    try {

        const submissionId = Number(req.params.id);
        const { status } = req.body;

        if (Number.isNaN(submissionId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });

        }

        const allowedStatuses = [
            'in_review',
            'approved',
            'change_requested'
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                success: false, 
                message: 'Invalid review status'
            });

        }

        await client.query('BEGIN');

        const submissionResult = await client.query(
            `SELECT
                s.id
                s.project_id,
                s.submitter_id,
                s.status
            FROM submissions s
            JOIN project_members pm
                ON s.project_id = pm.project_id
            WHERE 
                s.id = $1
            AND pm.user_id = $2
            FOR UPDATE`,
            [submissionId, req.user?.id]

        );

        if (submissionResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(403).json({
                success: false,
                message: 'You cannot review this submission'
            });

        }

        const submission = submissionResult.rows[0];
        const previousStatus = submission.status;

        const validationTransitions:
            Record<string, string[]> = {

                pending: ['in_review'],

                in_review: [
                    'approved',
                    'changes_requested'
                ],

                change_equested: [
                    'in_review'
                ],

                approved: []
            };

        if (previousStatus === status) {

            await client.query('ROLLBACK');

            return res.status(200).json({
                success: false,
                message: `Submission is already ${status}`
            });
        }

        if (!validationTransitions[previousStatus]
            ?.includes(status)
        ) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${previousStatus} to ${status}`
            });
        }

        const updatedSubmission = await client.query(
            `UPDATE submissions
            SET 
                status = $1
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                id = $2
            RETURNING
                id, 
                project_id,
                submitter_id,
                title,
                code,
                status,
                created_at,
                updated_at`,
            [status, submissionId]

        );

        await client.query(
            `INSERT INTO 
                review_history(
                    submission_id,
                    review_id,
                    previous_status, 
                    new_status
                )
            VALUES
                ($1, $2, $3, $4)`,
            [submissionId, req.user?.id, previousStatus, status]

        );

        await client.query('COMMIT');

        await createNotification(
            submission.submitter_id,
            `Your submission status changed from ${previousStatus}
            to ${status}`,
            'review_status_changed'
        );

        return res.status(200).json({
            success: true,
            message: 'Review status updated successfully',
            data: submissionResult.rows[0]
        });

    }
    catch (error) {

        await client.query('ROLLBACK');

        console.error('Error in updating status: ', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    } 
    finally {
        client.release();
    }
    
}

export async function getReviewHistory(
    req: AuthRequest,
    res: Response
) {

    try {

        const submissionId = Number(req.params.projectId);
        const userId = req.user?.id;

        if (Number.isNaN(submissionId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });
        }

        // check whether user owns or is a member of the project
        const access = await pool.query(
            `SELECT s.id
            FROM submissions s
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
                message: 'You do not have access to this resource'
            });

        }

        const result = await pool.query(
            `SELECT
                s.id,
                s.submission_id,
                s.reviewer_id,
                    u.name AS reviewer_name,

                s.previous_status,
                    s.new_status,
                    s.created_at
                FROM review_history s
                JOIN users u
                    ON s.reviewer_id = u.id
                WHERE s.submission_id = $1
                ORDER BY s.created_at ASC`,
            [submissionId]

        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    }
    catch (error) {

        console.error('Error in retrieving review history', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }
    
}

