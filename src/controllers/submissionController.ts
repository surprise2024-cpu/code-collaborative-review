import type { Response } from "express";

import pool from '../config/database.js';

import type { AuthRequest } from '../middleware/authMiddleware.js';

export async function createSubmission(
    req: AuthRequest,
    res: Response
) {

    try {

        const projectId = Number(req.params.projectId);

        const { title, code } = req.body;

        if (Number.isNaN(projectId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });
        }

        if (!title || !code) {

            return res.status(400).json({
                success: false,
                message: 'Title and code are required'
            });
        }

        // make sure the submitter owns the project
        const project = await pool.query(
            `SELECT id 
            FROM projects 
            WHERE id = $1 
            AND created_by = $2`,
            [projectId, req.user?.id]
        );

        if (project.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message: 'You cannot submit code to this project'
            });

        }

        const result = await pool.query(
            `INSERT INTO submissions 
                (project_id, submitter_id, title, code) 
            VALUES 
                ($1, $2, $3, $4) 
            RETURNING 
                id, project_id, submitter_id, title, code, status, created_at`,
            [projectId, req.user?.id, title, code]
        );

        return res.status(201).json({
            success: true,
            message: 'Submission created successfully',
            data: result.rows[0]
        });

    }
    catch (error) {

        console.error('Error creating submission:', error);

        return res.status(500).json({
            success: false,
            message: 'Error creating submission'
        });

    }

}

export async function getProjectSubmissions(
    req: AuthRequest,
    res: Response
) {

    try {

        const projectId = Number(req.params.projectId);
        const userId = req.user?.id;

        if (Number.isNaN(projectId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });
        }

        // check whether user owns or is a member of the project
        const access = await pool.query(
            `SELECT p.id
            FROM project p
            LEFT JOIN project_members pm
                ON p.id = pm.project_id
            WHERE p.id = $1
            AND (p.created_by = $2
                OR pm.user_id = $2
            )`,
            [projectId, userId]

        );

        if (access.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message: 'You do not have access to this project'
            });

        }

        const result = await pool.query(
            `SELECT
                s.id,
                s.project_id
                s.submitter_id,
                s.title,
                s.code,
                s.status,
                s.created_at,
                s.updated_at
            FROM submission s
            WHERE s.project_id = $1
            ORDER BY s.created_at DESC`,
            [projectId]

        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {

        console.error('Error in retrieving project', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }
    
}

export async function getSubmissionById(
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

        const result = await pool.query(
            `SELECT
                s.id,
                s.project_id,
                s.submitter_id,
                s.title,
                s.code,
                s.status,
                s.created_at,
                s.updated_at
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

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });

        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    }
    catch (error) {

        console.error('Error in retrieving project', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export async function updateSubmission(
    req: AuthRequest,
    res: Response
) {

    try {

        const submissionId = Number(req.params.id);
        const { title, code } = req.body;

        if (Number.isNaN(submissionId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });

        }

        if (!title || !code ) {

            return res.status(400).json({
                success: false,
                message: 'Title and code are required'
            });
        }

        const result = await pool.query(
            `UPDATE submissions
            SET 
                title = $1,
                code = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                id = $3
                AND submitter_id = $4
            RETURNING
                id, 
                project_id,
                submitter_id,
                title,
                code,
                status,
                created_at,
                updated_at`,
            [title, code, submissionId, req.user?.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });

        }

        return res.status(200).json({
            success: true,
            message: 'Submission successfully updated',
            data: result.rows[0]
        });

    }
    catch (error) {

        console.error('Error in updating submission', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}

export async function deleteSubmission(
    req: AuthRequest,
    res: Response
) {
    try {

        const submissionId = Number(req.params.id);

        if (
            Number.isNaN(submissionId)
        ) {

            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });

        }

        const result = await pool.query(
            `DELETE FROM submissions 
            WHERE 
                id = $1 
                AND submitter_id = $2
            RETURNING id`,
            [submissionId, req.user?.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
            
        }

        return res.status(200).json({
            success: true,
            message: 'Submission successfully deleted'
        });

    }
    catch (error) {

        console.error('Error deleting submission: ', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}