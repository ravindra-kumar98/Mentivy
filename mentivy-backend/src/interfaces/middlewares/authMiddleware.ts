import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required. Missing Bearer token.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';

        const decoded = jwt.verify(token, secret) as { userId: string; role: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
