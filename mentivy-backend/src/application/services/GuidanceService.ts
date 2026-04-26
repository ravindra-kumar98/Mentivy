import { UserProfileModel } from '../../infrastructure/database/models/UserProfileModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';

interface DailyPlanCategory {
    type: 'NEW' | 'WEAK' | 'REVISION';
    allocatedMinutes: number;
    topics: any[]; // In a real app, we'd type this properly
}

export class GuidanceService {
    static async generateDailyPlan(userId: string): Promise<DailyPlanCategory[]> {
        // 1. Get User Profile for time availability
        const profile = await UserProfileModel.findOne({ userId });
        const totalMinutes = profile?.dailyTimeAvailability || 120; // Default 120 mins

        // Time Allocation Split (40% New, 40% Weak, 20% Revision)
        const timeNew = Math.floor(totalMinutes * 0.40);
        const timeWeak = Math.floor(totalMinutes * 0.40);
        const timeRevision = totalMinutes - timeNew - timeWeak;

        // 2. Fetch Due Revisions (nextReviewDate <= now)
        const now = new Date();
        const dueRevisionsStats = await UserTopicStatModel.find({
            userId,
            nextReviewDate: { $lte: now }
        }).limit(5).exec();

        const revisionTopicIds = dueRevisionsStats.map(s => s.topicId);
        const revisionTopics = await TopicModel.find({ _id: { $in: revisionTopicIds } }).exec();

        // 3. Fetch Weak Topics (status === 'WEAK')
        // Exclude topics already in revision
        const weakStats = await UserTopicStatModel.find({
            userId,
            status: 'WEAK',
            topicId: { $nin: revisionTopicIds }
        }).limit(5).exec();

        const weakTopicIds = weakStats.map(s => s.topicId);
        const weakTopics = await TopicModel.find({ _id: { $in: weakTopicIds } }).exec();

        // 4. Fetch New Topics (topics not in UserTopicStat for this user)
        const allUserStats = await UserTopicStatModel.find({ userId }).select('topicId').exec();
        const attemptedTopicIds = allUserStats.map(s => s.topicId);

        const newTopics = await TopicModel.find({
            _id: { $nin: attemptedTopicIds }
        }).limit(5).exec();

        // 5. Structure the response
        return [
            {
                type: 'NEW',
                allocatedMinutes: timeNew,
                topics: newTopics.map(t => ({ id: t._id, name: t.name, subjectName: t.subjectName }))
            },
            {
                type: 'WEAK',
                allocatedMinutes: timeWeak,
                topics: weakTopics.map(t => ({ id: t._id, name: t.name, subjectName: t.subjectName }))
            },
            {
                type: 'REVISION',
                allocatedMinutes: timeRevision,
                topics: revisionTopics.map(t => ({ id: t._id, name: t.name, subjectName: t.subjectName }))
            }
        ];
    }
}
