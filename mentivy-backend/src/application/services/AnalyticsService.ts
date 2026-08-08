import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';
import { UserProfileModel } from '../../infrastructure/database/models/UserProfileModel';
import { GuidanceService } from './GuidanceService';

export class AnalyticsService {
    /**
     * Gets rich, comprehensive user activity and performance metrics for the last 7/30 days.
     */
    static async getUserAnalytics(userId: string, days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 1. Fetch user profile for target exam
        const profile = await UserProfileModel.findOne({ userId });
        const targetExam = profile?.targetExam || 'SSC CGL';

        // 2. Fetch all attempts in the period
        const attempts = await UserAttemptModel.find({
            userId,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: 1 });

        // 3. Group by date for the activity chart
        const dailyStats: Record<string, { date: string; count: number; correct: number; totalTime: number }> = {};
        
        // Initialize dates
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyStats[dateStr] = { date: dateStr, count: 0, correct: 0, totalTime: 0 };
        }

        attempts.forEach(attempt => {
            const dateStr = attempt.timestamp.toISOString().split('T')[0];
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].count++;
                dailyStats[dateStr].totalTime += (attempt.timeTaken || 0);
                if (attempt.isCorrect) dailyStats[dateStr].correct++;
            }
        });

        const activityChart = Object.values(dailyStats)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(s => ({
                date: s.date,
                questions: s.count,
                accuracy: s.count > 0 ? Math.round((s.correct / s.count) * 100) : 0,
                timeMins: Math.round(s.totalTime / 60)
            }));

        // 4. Topic & Subject Stats
        const allTopics = await TopicModel.find().exec();
        const topicStats = await UserTopicStatModel.find({ userId });
        const statMap = new Map<string, any>();
        topicStats.forEach(s => statMap.set(s.topicId, s));

        // Group by subject for subject distribution and subject accuracy
        const subjectQuestions: Record<string, number> = {};
        const subjectAccuracyMap: Record<string, { totalAccuracy: number; count: number }> = {};

        const detailedTopics: any[] = [];

        for (const topic of allTopics) {
            const topicId = (topic._id as any).toString();
            const stat = statMap.get(topicId);
            const subject = topic.subjectName || 'General';

            const attempted = stat?.totalAttempted || 0;
            const accuracy = stat ? Math.round(stat.accuracy || 0) : 0;
            const stage = GuidanceService.getStageFromInterval(stat?.spacedRepetitionInterval || 0);

            subjectQuestions[subject] = (subjectQuestions[subject] || 0) + attempted;

            if (attempted > 0) {
                if (!subjectAccuracyMap[subject]) {
                    subjectAccuracyMap[subject] = { totalAccuracy: 0, count: 0 };
                }
                subjectAccuracyMap[subject].totalAccuracy += accuracy;
                subjectAccuracyMap[subject].count += 1;
            }

            detailedTopics.push({
                id: topicId,
                name: topic.name,
                subjectName: subject,
                weightage: topic.weightage,
                accuracy,
                totalAttempted: attempted,
                status: stat?.status || 'NEW',
                stage
            });
        }

        const subjectChart = Object.entries(subjectQuestions).map(([name, value]) => ({
            name,
            value
        }));

        const subjectAccuracyList = Object.entries(subjectAccuracyMap).map(([subjectName, data]) => ({
            subjectName,
            accuracy: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0
        }));

        // 5. Weak Topics vs Strong Topics
        const weakTopics = detailedTopics
            .filter(t => t.totalAttempted > 0 && (t.status === 'WEAK' || t.accuracy < 50))
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3);

        const strongTopics = detailedTopics
            .filter(t => t.totalAttempted > 0 && (t.status === 'STRONG' || t.accuracy >= 75))
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 3);

        // 6. Overall Metrics & Projected Exam Score
        const totalQuestions = attempts.length;
        const totalCorrect = attempts.filter(a => a.isCorrect).length;
        const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        const totalStudySeconds = attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
        const totalStudyTimeMins = Math.round(totalStudySeconds / 60);
        const avgSpeedSeconds = totalQuestions > 0 ? Math.round(totalStudySeconds / totalQuestions) : 45;

        // SSC CGL Tier 1 standard: out of 200 marks
        const projectedMarks = Math.min(200, Math.round((overallAccuracy / 100) * 180 + (totalQuestions > 20 ? 15 : 0)));
        const examReadiness = Math.min(100, Math.round((overallAccuracy * 0.7) + (Math.min(100, totalQuestions * 2) * 0.3)));

        return {
            targetExam,
            activityChart,
            subjectChart,
            subjectAccuracyList,
            weakTopics,
            strongTopics,
            masteryBreakdown: {
                WEAK: topicStats.filter(s => s.status === 'WEAK').length,
                AVERAGE: topicStats.filter(s => s.status === 'AVERAGE').length,
                STRONG: topicStats.filter(s => s.status === 'STRONG').length,
            },
            totalQuestions,
            overallAccuracy,
            totalStudyTimeMins,
            avgSpeedSeconds,
            projectedScore: {
                marks: projectedMarks,
                maxMarks: 200,
                examReadinessPercent: examReadiness || 65,
                percentile: Math.min(99, Math.round(examReadiness * 0.95))
            }
        };
    }
}
