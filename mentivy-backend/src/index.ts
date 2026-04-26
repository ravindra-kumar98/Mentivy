import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './infrastructure/database/database';
import authRoutes from './interfaces/routes/auth.routes';
import guidanceRoutes from './interfaces/routes/guidance.routes';
import practiceRoutes from './interfaces/routes/practice.routes';
import questionRoutes from './interfaces/routes/question.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', message: 'Mentivy API is running' });
});

// Basic welcome route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Mentivy API' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/guidance', guidanceRoutes);
app.use('/api/v1/practice', practiceRoutes);
app.use('/api/v1/questions', questionRoutes);

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

connectDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
});
