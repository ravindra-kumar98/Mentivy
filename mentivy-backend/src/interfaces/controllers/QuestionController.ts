import { Request, Response } from 'express';
import { QuestionModel } from '../../infrastructure/database/models/QuestionModel';
import { QuestionService } from '../../application/services/QuestionService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { z } from 'zod';

export const getQuestionsSchema = z.object({
    query: z.object({
        topicId: z.string().min(1, 'topicId is required'),
        difficulty: z.string().optional().transform(v => v ? parseInt(v) : undefined),
        limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
    })
});

export const checkAnswerSchema = z.object({
    body: z.object({
        questionId: z.string().min(1, 'questionId is required'),
        selectedOptionIndex: z.number().int().min(0),
    })
});

export class QuestionController {
    /**
     * GET /api/v1/questions?topicId=...&difficulty=...&limit=...
     * Returns sanitized questions (no correct answer) for client-side rendering
     */
    static async getQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { topicId, difficulty, limit } = req.query as {
                topicId: string;
                difficulty?: string;
                limit?: string;
            };

            const questions = await QuestionService.getQuestionsForTopic(userId, {
                topicId,
                difficulty: difficulty ? parseInt(difficulty) : undefined,
                limit: limit ? parseInt(limit) : 10,
            });

            const sanitized = questions.map(QuestionService.sanitizeForClient);

            res.status(200).json({
                success: true,
                data: sanitized,
                count: sanitized.length,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    /**
     * POST /api/v1/questions/check
     * Checks if the selected answer is correct and returns the explanation.
     * This is called AFTER the user selects an option on the frontend.
     */
    static async checkAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { questionId, selectedOptionIndex } = req.body;

            const question = await QuestionModel.findById(questionId);
            if (!question) {
                res.status(404).json({ success: false, message: 'Question not found' });
                return;
            }

            const isCorrect = question.correctOptionIndex === selectedOptionIndex;

            res.status(200).json({
                success: true,
                data: {
                    isCorrect,
                    correctOptionIndex: question.correctOptionIndex,
                    explanation: question.explanation,
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
