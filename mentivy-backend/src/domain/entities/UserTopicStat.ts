export interface UserTopicStat {
    id?: string;
    userId: string;
    topicId: string;
    totalAttempted: number;
    accuracy: number; // percentage (0 to 100)
    status: 'WEAK' | 'AVERAGE' | 'STRONG';
    nextReviewDate?: Date;
    spacedRepetitionInterval: number; // in days
    lastAttemptedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
