import mongoose, { Schema, Document } from 'mongoose';
import { UserAttempt } from '../../../domain/entities/UserAttempt';

export interface IUserAttemptDocument extends Omit<UserAttempt, 'id'>, Document {}

const UserAttemptSchema = new Schema<IUserAttemptDocument>({
    userId: { type: String, required: true },
    questionId: { type: String, required: true },
    topicId: { type: String, required: true, index: true },
    isCorrect: { type: Boolean, required: true },
    timeTaken: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now }
});

// For quickly rolling up moving average accuracy per topic
UserAttemptSchema.index({ userId: 1, topicId: 1, timestamp: -1 });

export const UserAttemptModel = mongoose.model<IUserAttemptDocument>('UserAttempt', UserAttemptSchema);
