export interface UserProfile {
    id?: string;
    userId: string;
    targetExam: string;
    dailyTimeAvailability: number; // in minutes
    currentLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    createdAt?: Date;
    updatedAt?: Date;
}
