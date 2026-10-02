import pool from '../config/database.js'

export async function createNotification(
    userId: number,
    message: string,
    type: string
) {

    const result = await pool.query(
        `INSERT INTO notifications(
            user_id,
            message,
            type
        )
        VALUES
            ($1, $2, $3)
        RETURNING
            id,
            user_id,
            message,
            type,
            is_read,
            created_at`,
        [userId, message, type]
    );

    return result.rows[0];
    
}