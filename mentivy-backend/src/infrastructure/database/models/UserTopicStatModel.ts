import mongoose, { Schema, Document } from 'mongoose';
import { UserTopicStat } from '../../../domain/entities/UserTopicStat';

export interface IUserTopicStatDocument extends Omit<UserTopicStat, 'id'>, Document {}

const UserTopicStatSchema = new Schema<IUserTopicStatDocument>({
    userId: { type: String, required: true },
    topicId: { type: String, required: true },
    totalAttempted: { type: Number, required: true, default: 0 },
    accuracy: { type: Number, required: true, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['WEAK', 'AVERAGE', 'STRONG'], default: 'AVERAGE' },
    nextReviewDate: { type: Date },
    spacedRepetitionInterval: { type: Number, default: 0 },
    lastAttemptedAt: { type: Date }
}, { 
    timestamps: true 
});

// A user has one stat record per topic
UserTopicStatSchema.index({ userId: 1, topicId: 1 }, { unique: true });
// For fast querying of what to review today
UserTopicStatSchema.index({ userId: 1, nextReviewDate: 1 });

export const UserTopicStatModel = mongoose.model<IUserTopicStatDocument>('UserTopicStat', UserTopicStatSchema);
