import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Admin access required.' });
        return;
    }
    next();
};
