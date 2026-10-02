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

        const existingMember = await pool.query(
            `SELECT id 
            FROM project_members
            WHERE project_id = $1
            AND user_id = $2`,
            [projectId, userId]
        );

        if (existingMember.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: 'User is already a member of this project'
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

export async function getProjectMembers(
    req: AuthRequest,
    res: Response
) {
    try {   

        const projectId = Number(req.params.id);

        if (Number.isNaN(projectId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });

        }
        
        // user must own or belong to the project.
        const access = await pool.query(
            `SELECT p.id 
            FROM projects p
            LEFT JOIN project_members pm 
                ON p.id = pm.project_id
            WHERE p.id = $1 
            AND (p.created_by = $2 OR pm.user_id = $2)`,
            [projectId, req.user?.id]
        );

        if (access.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message: 'You do not have access to this project'
            });

        }

        const result = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                pm.created_at AS joined_at
            FROM project_members pm
            JOIN users u 
                ON pm.user_id = u.id
            WHERE pm.project_id = $1
            ORDER BY pm.created_at ASC`,
            [projectId]
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {

        console.error('Error fetching project members: ', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching project members'
        });

    }

}

export async function removeProjectMember(
    req: AuthRequest,
    res: Response
) {
    try {

        const projectId = Number(req.params.id);
        const userId = Number(req.params.userId);

        if (
            Number.isNaN(projectId) || 
            Number.isNaN(userId)
        ) {

            return res.status(400).json({
                success: false,
                message: 'Invalid project ID or user ID'
            });

        }

        // only the project owner can remove members
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
                message: 'Only the project owner can remove members'
            });
        }

        const result = await pool.query(
            `DELETE FROM project_members 
            WHERE project_id = $1 
            AND user_id = $2
            RETURNING id`,
            [projectId, userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Project member not found'
            });
            
        }

        return res.status(200).json({
            success: true,
            message: 'Project member successfully removed'
        });

    }
    catch (error) {

        console.error('Error removing project member: ', error);

        return res.status(500).json({
            success: false,
            message: 'Error removing project member'
        });

    }

}