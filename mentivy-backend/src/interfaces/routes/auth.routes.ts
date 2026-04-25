import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.enum(['STUDENT', 'ADMIN']).optional(),
        phoneNumber: z.string().optional(),
        targetExam: z.string().optional(),
        dailyTimeAvailability: z.number().optional(),
        currentLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string()
    })
});

// @route   POST /api/v1/auth/register
router.post('/register', validateRequest(registerSchema), AuthController.register);

// @route   POST /api/v1/auth/login
router.post('/login', validateRequest(loginSchema), AuthController.login);

export default router;
