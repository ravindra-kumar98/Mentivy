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
import analyticsRoutes from './interfaces/routes/analytics.routes';
import userRoutes from './interfaces/routes/user.routes';
import adminRoutes from './interfaces/routes/admin.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
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
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);

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
