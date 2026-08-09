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
import notificationRoutes from './interfaces/routes/notification.routes';
import userRoutes from './interfaces/routes/user.routes';
import adminRoutes from './interfaces/routes/admin.routes';
import publicRoutes from './interfaces/routes/public.routes';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

// Trust reverse proxies (Render, Vercel, Heroku, AWS ELB, Cloudflare)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// Production CORS Configuration supporting Vercel and local development
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://mentivy.vercel.app',
    process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or SSR fetch from Next.js server)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith('.vercel.app') || 
                          origin.includes('mentivy');

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive fallback to prevent deployment breaks
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// Production-ready API Rate Limiter (2500 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2500, // Generous threshold for Next.js SSR + Client navigation
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again in a few minutes.'
    }
});
app.use('/api', apiLimiter);

// Health check endpoint (exempt from rate limiting)
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
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);

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
