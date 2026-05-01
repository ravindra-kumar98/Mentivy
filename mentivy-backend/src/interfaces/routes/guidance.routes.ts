import { Router } from 'express';
import { GuidanceController } from '../controllers/GuidanceController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Protect all guidance routes
router.use(requireAuth);

router.get('/daily-plan', GuidanceController.getDailyPlan);
router.get('/stats', GuidanceController.getDashboardStats);

export default router;
