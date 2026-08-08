import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { NotificationService } from '../../application/services/NotificationService';

export class NotificationController {
    static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const data = await NotificationService.getUserNotifications(userId);
            res.status(200).json({
                success: true,
                data
            });
        } catch (error: any) {
            console.error('Error in getNotifications:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
        }
    }

    static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const notificationId = req.params.id as string;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const data = await NotificationService.markAsRead(userId, notificationId);
            res.status(200).json({
                success: true,
                data
            });
        } catch (error: any) {
            console.error('Error in markAsRead:', error);
            res.status(500).json({ success: false, message: 'Failed to update notification' });
        }
    }

    static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const data = await NotificationService.markAllAsRead(userId);
            res.status(200).json({
                success: true,
                data
            });
        } catch (error: any) {
            console.error('Error in markAllAsRead:', error);
            res.status(500).json({ success: false, message: 'Failed to mark notifications read' });
        }
    }

    static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const notificationId = req.params.id as string;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const data = await NotificationService.deleteNotification(userId, notificationId);
            res.status(200).json({
                success: true,
                data
            });
        } catch (error: any) {
            console.error('Error in deleteNotification:', error);
            res.status(500).json({ success: false, message: 'Failed to delete notification' });
        }
    }
}
