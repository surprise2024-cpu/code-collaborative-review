import express from 'express';
import cors from 'cors';

const app = express();

// allows the API to receive JSON request bodies
app.use(express.json());

// allows requests from other origins
app.use(cors());

// simple endpoint to check whther the API is working
app.get('/api/health', (req, res) => {

    res.status(200).json({
        success: true,
        message: `Code Collaborative Review API is running`
    });

});

export default app;