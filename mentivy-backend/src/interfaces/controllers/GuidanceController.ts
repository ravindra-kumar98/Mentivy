import { Request, Response } from 'express';
import { GuidanceService } from '../../application/services/GuidanceService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class GuidanceController {
    static async getDailyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const dailyPlan = await GuidanceService.generateDailyPlan(userId);

            res.status(200).json({
                success: true,
                message: 'Daily plan generated successfully',
                data: dailyPlan
            });
        } catch (error: any) {
            console.error('Error in getDailyPlan:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const stats = await GuidanceService.getDashboardStats(userId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            console.error('Error in getDashboardStats:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
