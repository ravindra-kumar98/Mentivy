import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';

export class PracticeService {
    static async submitAttempt(
        userId: string, 
        topicId: string, 
        questionId: string, 
        isCorrect: boolean, 
        timeTaken: number
    ) {
        // 1. Save the raw attempt
        await UserAttemptModel.create({
            userId,
            topicId,
            questionId,
            isCorrect,
            timeTaken,
            timestamp: new Date()
        });

        // 2. Fetch or create UserTopicStat
        let stat = await UserTopicStatModel.findOne({ userId, topicId });

        if (!stat) {
            stat = new UserTopicStatModel({
                userId,
                topicId,
                totalAttempted: 0,
                accuracy: 0,
                status: 'AVERAGE',
                spacedRepetitionInterval: 1 // start with 1 day
            });
        }

        // 3. Update total attempted and recalculate accuracy
        // For accurate recalculation, we should ideally sum all attempts, 
        // but for MVP, we can keep a running average or just fetch all attempts for this topic.
        const allTopicAttempts = await UserAttemptModel.find({ userId, topicId });
        const totalAttempts = allTopicAttempts.length;
        const correctAttempts = allTopicAttempts.filter(a => a.isCorrect).length;
        
        const newAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
        stat.totalAttempted = totalAttempts;
        stat.accuracy = newAccuracy;
        stat.lastAttemptedAt = new Date();

        // 4. Calculate new Status and Spaced Repetition Interval
        let multiplier = 1;

        if (newAccuracy >= 80) {
            stat.status = 'STRONG';
            multiplier = 2; // Increase interval by 2x
        } else if (newAccuracy >= 50) {
            stat.status = 'AVERAGE';
            multiplier = 1.5; // Increase interval by 1.5x
        } else {
            stat.status = 'WEAK';
            multiplier = 0; // Reset interval
        }

        // Apply Spaced Repetition Formula
        if (multiplier === 0) {
            stat.spacedRepetitionInterval = 1; // Reset to 1 day for weak topics
        } else {
            // Cap interval at max 30 days to ensure they review eventually
            const newInterval = Math.round(stat.spacedRepetitionInterval * multiplier);
            stat.spacedRepetitionInterval = Math.min(newInterval, 30); 
        }

        // Set next review date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + stat.spacedRepetitionInterval);
        stat.nextReviewDate = nextDate;

        await stat.save();

        return {
            success: true,
            newAccuracy: stat.accuracy,
            newStatus: stat.status,
            nextReviewDate: stat.nextReviewDate
        };
    }
}
