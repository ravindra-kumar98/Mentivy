import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
        res.status(403).json({ success: false, message: 'Admin or Super Admin access required.' });
        return;
    }
    next();
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
        res.status(403).json({ success: false, message: 'Super Admin access required.' });
        return;
    }
    next();
};
