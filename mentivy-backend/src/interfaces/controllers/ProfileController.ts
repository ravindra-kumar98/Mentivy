import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { ProfileService } from '../../application/services/ProfileService';

export class ProfileController {
    static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const profile = await ProfileService.getProfile(userId);
            res.status(200).json({ success: true, data: profile });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || 'Internal server error' });
        }
    }

    static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const updated = await ProfileService.updateProfile(userId, req.body);
            res.status(200).json({ success: true, message: 'Profile updated successfully', data: updated });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || 'Internal server error' });
        }
    }

    static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const result = await ProfileService.changePassword(userId, req.body);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to change password' });
        }
    }

    static async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const result = await ProfileService.deleteAccount(userId, req.body);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to delete account' });
        }
    }
}
