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