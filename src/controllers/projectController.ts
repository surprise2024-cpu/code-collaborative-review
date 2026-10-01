import type { Response } from "express";

import pool from '../config/database.js';

import { AuthRequest } from '../middleware/authMiddleware.js';

export async function createProject(
    req: AuthRequest,
    res: Response
) {

    try {
        const { name, description } = req.body;

        if (!name) {

            return res.status(400).json({
                success: false,
                message: 'Project name is required'
            });

        }

        // create the project
        const result = await pool.query(
            `INSERT INTO projects 
                (name, description, created_by)
            VALUES 
                ($1, $2, $3)
            RETURNING 
                id, 
                name, 
                description, 
                created_by, 
                created_at`,
            [name, description ?? null, req.user?.id]
        );

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: result.rows[0]
        });

    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Error creating project'
        });

    }

}

export async function getProject(
    req: AuthRequest,
    res: Response
) {
    
    try {
        const result = await pool.query(
            `SELECT DISTINCT
                p.id,
                p.name,
                p.description,
                p.created_by,
                p.created_at,
                p.updated_at
            FROM 
                projects p
            LEFT JOIN project_members pm
                ON p.id = pm.project_id
            WHERE 
                p.created_by = $1
                OR pm.user_id = $1
            ORDER BY p.created_at DESC`,
            [req.user?.id]
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    }
    catch (error) {

        console.error('Error retrieving project:', error);

        return res.status(500).json({
            success: false,
            message: 'Error retrieving project'
        }); 

    }

}