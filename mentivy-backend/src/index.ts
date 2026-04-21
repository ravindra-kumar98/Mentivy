import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
