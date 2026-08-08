import { NotificationModel, NotificationType } from '../../infrastructure/database/models/NotificationModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';

export class NotificationService {
    /**
     * Fetches all notifications for a user, automatically generating fresh contextual alerts if needed.
     */
    static async getUserNotifications(userId: string) {
        // Ensure user has at least contextual notifications
        await this.syncContextualNotifications(userId);

        const notifications = await NotificationModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .exec();

        const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });

        return {
            notifications,
            unreadCount
        };
    }

    /**
     * Marks a specific notification as read.
     */
    static async markAsRead(userId: string, notificationId: string) {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );
        const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });
        return { notification, unreadCount };
    }

    /**
     * Marks all notifications as read.
     */
    static async markAllAsRead(userId: string) {
        await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
        return { success: true, unreadCount: 0 };
    }

    /**
     * Deletes a specific notification.
     */
    static async deleteNotification(userId: string, notificationId: string) {
        await NotificationModel.findOneAndDelete({ _id: notificationId, userId });
        const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });
        return { success: true, unreadCount };
    }

    /**
     * Creates a new notification for a user.
     */
    static async createNotification(
        userId: string, 
        type: NotificationType, 
        title: string, 
        message: string, 
        actionUrl?: string, 
        actionLabel?: string
    ) {
        return await NotificationModel.create({
            userId,
            type,
            title,
            message,
            actionUrl: actionUrl || '/study-plan',
            actionLabel: actionLabel || 'Review Now',
            isRead: false
        });
    }

    /**
     * Automatically generates intelligent contextual notifications based on user SRS intervals and topic mastery.
     */
    private static async syncContextualNotifications(userId: string) {
        const count = await NotificationModel.countDocuments({ userId });
        if (count > 0) return; // Already initialized

        const stats = await UserTopicStatModel.find({ userId });
        const allTopics = await TopicModel.find();
        const topicMap = new Map<string, any>();
        allTopics.forEach(t => topicMap.set((t._id as any).toString(), t));

        const now = new Date();

        // 1. Spaced Repetition Due Alert
        const dueReviews = stats.filter(s => s.nextReviewDate && new Date(s.nextReviewDate) <= now);
        if (dueReviews.length > 0) {
            const firstTopic = topicMap.get(dueReviews[0].topicId)?.name || 'Quantitative Aptitude';
            await this.createNotification(
                userId,
                'SRS_REVISION',
                '⚡ Spaced Repetition Due Today',
                `${dueReviews.length} topic${dueReviews.length > 1 ? 's are' : ' is'} due for memory retention review (including ${firstTopic}).`,
                '/study-plan',
                'Open Daily Plan'
            );
        } else {
            await this.createNotification(
                userId,
                'SRS_REVISION',
                '⚡ Daily Memory Cycle Ready',
                'Your AI Spaced Repetition queue has been synthesized for today with 5-stage Leitner intervals.',
                '/study-plan',
                'View Study Plan'
            );
        }

        // 2. Weak Topic Intervention
        const weakStat = stats.find(s => s.status === 'WEAK' || s.accuracy < 50);
        if (weakStat) {
            const topic = topicMap.get(weakStat.topicId);
            const name = topic ? topic.name : 'Medieval History';
            await this.createNotification(
                userId,
                'WEAK_ALERT',
                `⚠️ Weak Area Booster: ${name}`,
                `Your recent accuracy in ${name} is ${Math.round(weakStat.accuracy || 35)}%. Practice a 10-question drill to improve mastery.`,
                `/practice?topicId=${weakStat.topicId}&topicName=${encodeURIComponent(name)}`,
                'Drill Topic'
            );
        }

        // 3. Daily Streak Milestone Alert
        await this.createNotification(
            userId,
            'STREAK_GOAL',
            '🔥 4-Day Active Streak Alive!',
            'Complete at least 15 minutes of practice today to keep your streak multiplier active.',
            '/dashboard',
            'Check Progress'
        );

        // 4. Mock Test Readiness
        await this.createNotification(
            userId,
            'MOCK_RESULT',
            '⏱️ 25-Min Timed Mock Test Ready',
            'Standard SSC CGL Tier 1 exam format with 25 questions and +2 / -0.5 negative marking.',
            '/practice?mode=MOCK_TEST',
            'Launch Mock Test'
        );
    }
}
