import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';

export class AnalyticsService {
    /**
     * Gets user activity and performance metrics for the last 7/30 days.
     */
    static async getUserAnalytics(userId: string, days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 1. Fetch all attempts in the period
        const attempts = await UserAttemptModel.find({
            userId,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: 1 });

        // 2. Group by date for the activity chart
        const dailyStats: Record<string, { date: string; count: number; correct: number }> = {};
        
        // Initialize dates
        for (let i = 0; i <= days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyStats[dateStr] = { date: dateStr, count: 0, correct: 0 };
        }

        attempts.forEach(attempt => {
            const dateStr = attempt.timestamp.toISOString().split('T')[0];
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].count++;
                if (attempt.isCorrect) dailyStats[dateStr].correct++;
            }
        });

        const activityChart = Object.values(dailyStats)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(s => ({
                date: s.date,
                questions: s.count,
                accuracy: s.count > 0 ? Math.round((s.correct / s.count) * 100) : 0
            }));

        // 3. Subject distribution
        const topicStats = await UserTopicStatModel.find({ userId });
        const subjectDistribution: Record<string, number> = {};

        for (const stat of topicStats) {
            const topic = await TopicModel.findById(stat.topicId);
            if (topic) {
                const subject = topic.subjectName || 'General';
                subjectDistribution[subject] = (subjectDistribution[subject] || 0) + stat.totalAttempted;
            }
        }

        const subjectChart = Object.entries(subjectDistribution).map(([name, value]) => ({
            name,
            value
        }));

        // 4. Mastery Breakdown
        const masteryBreakdown = {
            WEAK: topicStats.filter(s => s.status === 'WEAK').length,
            AVERAGE: topicStats.filter(s => s.status === 'AVERAGE').length,
            STRONG: topicStats.filter(s => s.status === 'STRONG').length,
        };

        return {
            activityChart,
            subjectChart,
            masteryBreakdown,
            totalQuestions: attempts.length,
            totalStudyTimeMins: Math.round(attempts.reduce((sum, a) => sum + a.timeTaken, 0) / 60)
        };
    }
}
