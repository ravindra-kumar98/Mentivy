import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';

export class GuidanceService {
    /**
     * Processes a user attempt and updates their topic mastery and SRS schedule.
     */
    static async processAttempt(userId: string, topicId: string, questionId: string, isCorrect: boolean, timeTaken: number) {
        // 1. Record the individual attempt
        await UserAttemptModel.create({
            userId,
            topicId,
            questionId,
            isCorrect,
            timeTaken,
            timestamp: new Date()
        });

        // 2. Fetch current stats or create new if not exists
        let stats = await UserTopicStatModel.findOne({ userId, topicId });
        if (!stats) {
            stats = new UserTopicStatModel({
                userId,
                topicId,
                totalAttempted: 0,
                accuracy: 0,
                status: 'AVERAGE',
                spacedRepetitionInterval: 0
            });
        }

        // 3. Update basic stats
        stats.totalAttempted += 1;
        
        // Moving average accuracy (weighting recent performance slightly more)
        const currentAccuracy = stats.accuracy || 0;
        stats.accuracy = isCorrect 
            ? Math.min(100, currentAccuracy + (100 - currentAccuracy) * 0.2)
            : Math.max(0, currentAccuracy - currentAccuracy * 0.2);

        // 4. Update Status based on accuracy
        if (stats.accuracy < 40) {
            stats.status = 'WEAK';
        } else if (stats.accuracy > 80) {
            stats.status = 'STRONG';
        } else {
            stats.status = 'AVERAGE';
        }

        // 5. SRS Algorithm (Simple version)
        // If correct, double the interval. If wrong, reset to 0.
        let interval = stats.spacedRepetitionInterval || 0;
        if (isCorrect) {
            interval = interval === 0 ? 1 : interval * 2;
        } else {
            interval = 0;
        }
        
        stats.spacedRepetitionInterval = interval;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);
        stats.nextReviewDate = nextDate;
        stats.lastAttemptedAt = new Date();

        await stats.save();
        return stats;
    }

    /**
     * Maps user status to a difficulty level for question fetching.
     */
    static getDifficultyForStatus(status: string): number {
        switch (status) {
            case 'WEAK': return 1;    // Easy
            case 'AVERAGE': return 2; // Medium
            case 'STRONG': return 3;  // Hard
            default: return 2;
        }
    }

    /**
     * Generates a personalized daily study plan for the user.
     */
    static async generateDailyPlan(userId: string) {
        // 1. Fetch all topics to see what's "NEW"
        const allTopics = await TopicModel.find().exec();
        
        // 2. Fetch user stats for all topics
        const userStats = await UserTopicStatModel.find({ userId }).exec();
        const attemptedTopicIds = new Set(userStats.map(s => s.topicId));

        // 3. Categorize topics
        const plan = [
            { type: 'NEW', allocatedMinutes: 60, topics: [] as any[] },
            { type: 'WEAK', allocatedMinutes: 30, topics: [] as any[] },
            { type: 'REVISION', allocatedMinutes: 30, topics: [] as any[] }
        ];

        const now = new Date();

        for (const topic of allTopics) {
            const topicId = (topic._id as any).toString();
            const stat = userStats.find(s => s.topicId === topicId);

            if (!stat) {
                // Topic hasn't been attempted yet
                if (plan[0].topics.length < 3) {
                    plan[0].topics.push({ id: topicId, name: topic.name, subjectName: topic.subjectName });
                }
            } else {
                // Topic has stats, check if it's WEAK or REVISION
                if (stat.status === 'WEAK') {
                    if (plan[1].topics.length < 2) {
                        plan[1].topics.push({ id: topicId, name: topic.name, subjectName: topic.subjectName });
                    }
                } else if (stat.nextReviewDate && stat.nextReviewDate <= now) {
                    if (plan[2].topics.length < 2) {
                        plan[2].topics.push({ id: topicId, name: topic.name, subjectName: topic.subjectName });
                    }
                }
            }
        }

        return plan;
    }

    /**
     * Fetches summary statistics for the user dashboard.
     */
    static async getDashboardStats(userId: string) {
        const stats = await UserTopicStatModel.find({ userId }).exec();
        
        const totalAttempted = stats.reduce((sum, s) => sum + s.totalAttempted, 0);
        const avgAccuracy = stats.length > 0 
            ? Math.round(stats.reduce((sum, s) => sum + s.accuracy, 0) / stats.length)
            : 0;
            
        const weakTopics = stats
            .filter(s => s.status === 'WEAK')
            .slice(0, 3);
            
        // Fetch topic names for weak topics
        const weakTopicDetails = await Promise.all(weakTopics.map(async (s) => {
            const topic = await TopicModel.findById(s.topicId);
            return topic ? topic.name : 'Unknown Topic';
        }));

        return {
            totalAttempted,
            avgAccuracy,
            weakTopics: weakTopicDetails,
            dailyGoalMins: 120, // This could be pulled from UserProfile
            completedMins: 45    // This could be calculated from UserAttemptModel today
        };
    }
}
