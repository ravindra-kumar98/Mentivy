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
        let token: string | undefined;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies?.refreshToken) {
            // Fallback for SSR requests: use refreshToken cookie
            token = req.cookies.refreshToken;
        }

        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }

        const accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

        try {
            // Try as Access Token first
            const decoded = jwt.verify(token, accessSecret) as { userId: string; role: string };
            req.user = decoded;
            next();
        } catch (err) {
            // If it failed and it was from a cookie, it might be a refresh token
            if (req.cookies?.refreshToken && token === req.cookies.refreshToken) {
                const decoded = jwt.verify(token, refreshSecret) as { userId: string; role: string };
                // Refresh tokens usually only have userId, but we'll adapt
                req.user = { userId: decoded.userId, role: 'STUDENT' }; // Default role or fetch from DB
                next();
            } else {
                throw err;
            }
        }
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired session.' });
    }
};
