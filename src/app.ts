import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { 
    authenticateToken,
    type AuthRequest
} from './middleware/authMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { error } from 'node:console';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// allows the API to receive JSON request bodies
app.use(express.json());

// allows requests from other origins
app.use(cors());

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/projects', projectRoutes);

app.use('/api', submissionRoutes);

app.use('/api', commentRoutes);

app.use('/api', reviewRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api', statsRoutes)

app.use(errorHandler)

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