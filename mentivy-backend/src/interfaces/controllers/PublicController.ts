import { Request, Response } from 'express';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { QuestionModel } from '../../infrastructure/database/models/QuestionModel';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';
import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';

export class PublicController {
    /**
     * GET /api/v1/public/stats
     * Returns aggregate platform metrics for public pages (e.g. landing page)
     */
    static async getLandingStats(req: Request, res: Response): Promise<void> {
        try {
            const [totalStudents, totalQuestions, totalTopics, totalAttempts, accuracyAggregation] = await Promise.all([
                UserModel.countDocuments({ role: 'STUDENT' }),
                QuestionModel.countDocuments(),
                TopicModel.countDocuments(),
                UserAttemptModel.countDocuments(),
                UserTopicStatModel.aggregate([
                    { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
                ]),
            ]);

            const avgAccuracy = accuracyAggregation.length > 0 
                ? Math.round(accuracyAggregation[0].avgAccuracy || 0) 
                : 0;

            res.status(200).json({
                success: true,
                data: {
                    totalStudents,
                    totalQuestions,
                    totalTopics,
                    totalAttempts,
                    avgAccuracy,
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}
