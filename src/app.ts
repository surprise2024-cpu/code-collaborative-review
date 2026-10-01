import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { 
    authenticateToken,
    type AuthRequest
} from './middleware/authMiddleware.js';

const app = express();

// allows the API to receive JSON request bodies
app.use(express.json());

// allows requests from other origins
app.use(cors());

app.use('/api/auth', authRoutes);

// simple endpoint to check whther the API is working
app.get('/api/health', (req, res) => {

    res.status(200).json({
        success: true,
        message: `Code Collaborative Review API is running`
    });

});

app.get(
    '/api/protected', 
    authenticateToken, 
    (req: AuthRequest, res) => {

        res.status(200).json({
            success: true,
            message: 'This is a protected route',
            user: req.user
        });

    }
    
);

export default app;