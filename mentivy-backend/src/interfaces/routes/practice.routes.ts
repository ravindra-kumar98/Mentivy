import { Router } from 'express';
import { PracticeController, submitAttemptSchema } from '../controllers/PracticeController';
import { QuestionController } from '../controllers/QuestionController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Protect all practice routes
router.use(requireAuth);

router.post('/submit', validateRequest(submitAttemptSchema), PracticeController.submitAttempt);
router.post('/submit-mock', QuestionController.submitMockSession);

export default router;
