export interface UserAttempt {
    id?: string;
    userId: string;
    questionId: string;
    topicId: string;
    isCorrect: boolean;
    timeTaken: number; // time taken in seconds
    timestamp: Date;
}
