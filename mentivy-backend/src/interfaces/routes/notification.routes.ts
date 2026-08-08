import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

// GET /api/v1/notifications
router.get('/', NotificationController.getNotifications);

// POST /api/v1/notifications/mark-all-read
router.post('/mark-all-read', NotificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/:id/read', NotificationController.markAsRead);

// DELETE /api/v1/notifications/:id
router.delete('/:id', NotificationController.deleteNotification);

export default router;
