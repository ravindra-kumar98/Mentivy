import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireAdmin, requireSuperAdmin } from '../middlewares/adminMiddleware';

const router = Router();

// Protect all admin routes with auth (Admin or Super Admin)
router.use(requireAuth);
router.use(requireAdmin);

// Stats overview (Scoped for Teacher, Global for Super Admin)
router.get('/stats', AdminController.getStats);

// Available Subject Fields
router.get('/fields', AdminController.getAvailableFields);

// Topics CRUD (Subject-Scoped)
router.get('/topics', AdminController.getTopics);
router.post('/topics', AdminController.createTopic);
router.put('/topics/:id', AdminController.updateTopic);
router.delete('/topics/:id', AdminController.deleteTopic);

// Questions CRUD & Bulk Import (Subject-Scoped)
router.get('/questions', AdminController.getQuestions);
router.post('/questions', AdminController.createQuestion);
router.put('/questions/:id', AdminController.updateQuestion);
router.delete('/questions/:id', AdminController.deleteQuestion);
router.post('/questions/bulk', AdminController.bulkImportQuestions);

// User Management (Teachers see Students only; Super Admin sees all)
router.get('/users', AdminController.getUsers);

// Super Admin Only: Promote/Demote roles & Assign Subject Fields
router.patch('/users/:id/role', requireSuperAdmin, AdminController.updateUserRole);

export default router;
