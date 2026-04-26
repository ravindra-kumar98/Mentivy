import { Request, Response } from 'express';
import { PracticeService } from '../../application/services/PracticeService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { z } from 'zod';

export const submitAttemptSchema = z.object({
    body: z.object({
        topicId: z.string().min(1, 'Topic ID is required'),
        questionId: z.string().min(1, 'Question ID is required'),
        isCorrect: z.boolean(),
        timeTaken: z.number().min(0)
    })
});

export class PracticeController {
    static async submitAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { topicId, questionId, isCorrect, timeTaken } = req.body;

            const result = await PracticeService.submitAttempt(
                userId,
                topicId,
                questionId,
                isCorrect,
                timeTaken
            );

            res.status(200).json({
                success: true,
                message: 'Attempt recorded successfully',
                data: result
            });
        } catch (error: any) {
            console.error('Error in submitAttempt:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
