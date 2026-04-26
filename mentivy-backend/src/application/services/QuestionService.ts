import { QuestionModel } from '../../infrastructure/database/models/QuestionModel';
import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';

interface GetQuestionsOptions {
    topicId: string;
    difficulty?: number;
    limit?: number;
    excludeIds?: string[]; // IDs the user already answered recently
}

export class QuestionService {
    /**
     * Get practice questions for a topic.
     * Excludes recently-seen questions for variety.
     */
    static async getQuestionsForTopic(
        userId: string,
        options: GetQuestionsOptions
    ) {
        const { topicId, difficulty, limit = 10, excludeIds = [] } = options;

        // Build the query filter
        const filter: Record<string, any> = { topicId };

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        // Exclude questions the user attempted in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentAttempts = await UserAttemptModel.find({
            userId,
            topicId,
            timestamp: { $gte: sevenDaysAgo }
        }).select('questionId').exec();

        const recentQuestionIds = [
            ...excludeIds,
            ...recentAttempts.map(a => a.questionId)
        ];

        if (recentQuestionIds.length > 0) {
            filter._id = { $nin: recentQuestionIds };
        }

        const questions = await QuestionModel.find(filter)
            .limit(limit)
            .exec();

        // If we ran out of "fresh" questions, fall back to all questions for this topic
        if (questions.length === 0) {
            return QuestionModel.find({ topicId }).limit(limit).exec();
        }

        return questions;
    }

    /**
     * Sanitize question for the client — NEVER send correctOptionIndex.
     */
    static sanitizeForClient(question: any) {
        return {
            id: question._id,
            topicId: question.topicId,
            content: question.content,
            options: question.options,
            difficulty: question.difficulty,
            tags: question.tags,
        };
    }
}
