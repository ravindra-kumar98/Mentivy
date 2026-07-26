import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/adminMiddleware';

const router = Router();

// Protect all admin routes with auth AND admin checks
router.use(requireAuth);
router.use(requireAdmin);

// Stats overview
router.get('/stats', AdminController.getStats);

// Topics
router.get('/topics', AdminController.getTopics);
router.post('/topics', AdminController.createTopic);
router.delete('/topics/:id', AdminController.deleteTopic);

// Questions
router.get('/questions', AdminController.getQuestions);
router.post('/questions', AdminController.createQuestion);
router.delete('/questions/:id', AdminController.deleteQuestion);

export default router;
