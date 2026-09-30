import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// gets PostgreSQL connnection-pool class
const { Pool } = pg;

// creates the database connection pool
// that manages reusable database connections
const pool = new Pool({

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});

export default pool;