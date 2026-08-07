import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/profile', ProfileController.getProfile);
router.put('/profile', ProfileController.updateProfile);
router.post('/change-password', ProfileController.changePassword);
router.delete('/account', ProfileController.deleteAccount);

export default router;
