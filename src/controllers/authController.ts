import { Request, response, Response } from "express";
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

export async function register(
    req: Request,
    res: Response
) {

    try {

        const {
            name, 
            email, 
            password, 
            role
        } = req.body;

        // check that all required fields were provided
        if (!name || !email || !password || !role) {

            return res.status(400).json({
                success: false,
                message: 'Name, email, password and role are required'
            });

        }

        // check that the role is valid
        if (role !== 'reviewer' && role !== 'submitter') {

            return res.status(400).json({
                success: false,
                message: 'Role must be reviewer or submitter'
            });

        }

        // check whether the email already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: 'Email already registers'
            });

        }

        // hash the passwrod before storing it
        const passwordHash = await bcrypt.hash(password, 10);

        // create the user
        const result = await pool.query(
            `INSERT INTO users
                (name, email, password_hash, role)
            VALUES
                ($1, $2, $3, $4)

            Returning id, name, email, role, display_picture, created_at`,

            [
                name,
                email,
                passwordHash,
                role
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result.rows[0]

        });
    }
    catch (error) {

        console.error('Registration errors: ', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}

export async function login(
    req: Request,
    res: Response
) {
    try {

        const { email, password } = req.body;

        // check that all required fields were provided
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });

        }

        // find the user
        const result = await pool.query(
            `SELECT 
                id,
                name, 
                email,
                password_hash,
                role,
                display_picture
            FROM users
            WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0 ) {

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });

        }

        const user = result.rows[0];

        // compare password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // create jwt token
        const token = jwt.sign(
            {
                id: user.id,
                // name: user.name,
                // email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: '3h'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    display_picture: user.display_picture
                }
                
            }

        });

    } 
    catch (error) {

        console.error('Login error: ', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

}