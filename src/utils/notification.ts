import pool from '../config/database.js'

export async function createNotification(
    userId: number,
    message: string,type: string
) {

    await pool.query(
        `INSERT INTO notifications(
            user_id,
            message,
            type
        )
        VALUES
            ($1, $2, $3)`,
        [userId, message, type]
    );
}