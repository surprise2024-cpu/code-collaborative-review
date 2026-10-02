import { 
    AuthRequest 
} from "../middleware/authMiddleware.js";

import pool from "../config/database.js";

import type { 
    Response 
} from "express";

export async function updateCommentStatus(
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

        if (previousStatus === status) {

            await client.query('ROLLBACK');

            return res.status(200).json({
                success: false,
                message: `Submission is already ${status}`
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

