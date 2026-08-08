import { Request, Response } from 'express';
import { QuestionModel } from '../../infrastructure/database/models/QuestionModel';
import { QuestionService } from '../../application/services/QuestionService';
import { GuidanceService } from '../../application/services/GuidanceService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { z } from 'zod';

export const getQuestionsSchema = z.object({
    query: z.object({
        topicId: z.string().optional(),
        subjectName: z.string().optional(),
        difficulty: z.string().optional().transform(v => v ? parseInt(v) : undefined),
        limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
        mode: z.enum(['PRACTICE', 'MOCK_TEST', 'WEAK_DRILL']).optional(),
        examType: z.string().optional()
    })
});

export const checkAnswerSchema = z.object({
    body: z.object({
        questionId: z.string().min(1, 'questionId is required'),
        selectedOptionIndex: z.number().int().min(0),
        topicId: z.string().optional(),
        timeTaken: z.number().optional()
    })
});

export class QuestionController {
    /**
     * GET /api/v1/questions?topicId=...&difficulty=...&limit=...&mode=...
     * Returns sanitized questions for client-side rendering.
     */
    static async getQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { topicId, subjectName, difficulty, limit, mode, examType } = req.query as {
                topicId?: string;
                subjectName?: string;
                difficulty?: string;
                limit?: string;
                mode?: 'PRACTICE' | 'MOCK_TEST' | 'WEAK_DRILL';
                examType?: string;
            };

            const questions = await QuestionService.getQuestions(userId, {
                topicId,
                subjectName,
                difficulty: difficulty ? parseInt(difficulty) : undefined,
                limit: limit ? parseInt(limit) : 10,
                mode,
                examType
            });

            res.status(200).json({
                success: true,
                data: questions,
                count: questions.length,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    /**
     * GET /api/v1/questions/topics
     * Returns all subjects and topics grouped with question counts and user stats.
     */
    static async getTopicsList(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const topics = await QuestionService.getTopicsSummary(userId);
            res.status(200).json({
                success: true,
                data: topics
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    /**
     * POST /api/v1/questions/check
     * Checks if the selected answer is correct and returns the explanation.
     */
    static async checkAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { questionId, selectedOptionIndex, topicId, timeTaken = 0 } = req.body;

            const question = await QuestionModel.findById(questionId);
            if (!question) {
                res.status(404).json({ success: false, message: 'Question not found' });
                return;
            }

            const isCorrect = question.correctOptionIndex === selectedOptionIndex;

            // Update user stats and SRS
            const updatedStats = await GuidanceService.processAttempt(
                userId,
                topicId || question.topicId,
                questionId,
                isCorrect,
                timeTaken
            );

            res.status(200).json({
                success: true,
                data: {
                    isCorrect,
                    correctOptionIndex: question.correctOptionIndex,
                    explanation: question.explanation,
                    userStatus: updatedStats.status,
                    accuracy: Math.round(updatedStats.accuracy)
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    /**
     * POST /api/v1/practice/submit-mock
     * Submits an entire mock test session and computes full score with negative marking.
     */
    static async submitMockSession(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { answers } = req.body;

            const result = await QuestionService.submitMockSession(userId, answers);

            res.status(200).json({
                success: true,
                message: 'Mock test evaluated successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to submit mock test' });
        }
    }
}
