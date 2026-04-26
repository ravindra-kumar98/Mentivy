import { Router } from 'express';
import { QuestionController, getQuestionsSchema, checkAnswerSchema } from '../controllers/QuestionController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.use(requireAuth);

// GET /api/v1/questions?topicId=...
router.get('/', QuestionController.getQuestions);

// POST /api/v1/questions/check  — verify a selected answer
router.post('/check', validateRequest(checkAnswerSchema), QuestionController.checkAnswer);

export default router;
