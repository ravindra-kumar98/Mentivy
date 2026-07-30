export interface UserProfile {
    id?: string;
    userId: string;
    targetExam: string;
    targetYear?: number;
    dailyTimeAvailability: number; // in minutes
    currentLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    preferredLanguage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
