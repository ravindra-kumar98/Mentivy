import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../infrastructure/database/models/UserModel';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
        assignedFields?: string[];
        email?: string;
    };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

        let userId: string | undefined;

        try {
            const decoded = jwt.verify(token, accessSecret) as { userId: string; role: string };
            userId = decoded.userId;
        } catch (err) {
            if (req.cookies?.refreshToken && token === req.cookies.refreshToken) {
                const decoded = jwt.verify(token, refreshSecret) as { userId: string; role: string };
                userId = decoded.userId;
            } else {
                throw err;
            }
        }

        if (!userId) {
            res.status(401).json({ success: false, message: 'Invalid token payload.' });
            return;
        }

        // Fetch fresh user record from DB for live role & assignedFields check
        const dbUser = await UserModel.findById(userId).select('role assignedFields email').lean();
        if (!dbUser) {
            res.status(401).json({ success: false, message: 'User account not found.' });
            return;
        }

        req.user = {
            userId: dbUser._id.toString(),
            role: dbUser.role as 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN',
            assignedFields: dbUser.assignedFields || [],
            email: dbUser.email
        };

        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired session.' });
    }
};
