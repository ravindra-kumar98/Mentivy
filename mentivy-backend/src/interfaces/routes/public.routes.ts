import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';

const router = Router();

// GET /api/v1/public/stats
router.get('/stats', PublicController.getLandingStats);

export default router;
