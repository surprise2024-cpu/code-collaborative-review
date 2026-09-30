import app from './app.js';
import pool from './config/database.js';

const PORT = Number(process.env.PORT) || 3000;

// don't start the server unless PostgreSQL is reachable
async function startServer() {

    try {

        // test the PostfreSQL connection
        await pool.query('SELECT NOW()');

        console.log('Database connected successfully');

        app.listen(PORT, () => {

            console.log(
                `Code Collaborative Review API is running on port: ${PORT}`
            );

        });

    }
    catch (error) {

        console.log('Database connected failed: ', error);

        process.exit(1);
    }

}

startServer();