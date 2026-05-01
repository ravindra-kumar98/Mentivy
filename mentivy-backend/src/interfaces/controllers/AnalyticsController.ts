import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AnalyticsService } from '../../application/services/AnalyticsService';

export class AnalyticsController {
    static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const days = parseInt(req.query.days as string) || 7;
            const data = await AnalyticsService.getUserAnalytics(userId, days);

            res.status(200).json({
                success: true,
                data
            });
        } catch (error: any) {
            console.error('Error in getAnalytics:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
