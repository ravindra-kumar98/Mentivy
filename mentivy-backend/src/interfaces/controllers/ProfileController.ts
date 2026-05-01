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
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            await ProfileService.updateProfile(userId, req.body);
            res.status(200).json({ success: true, message: 'Profile updated successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
