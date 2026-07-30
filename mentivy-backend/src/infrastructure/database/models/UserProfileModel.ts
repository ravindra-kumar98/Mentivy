import mongoose, { Schema, Document } from 'mongoose';
import { UserProfile } from '../../../domain/entities/UserProfile';

export interface IUserProfileDocument extends Omit<UserProfile, 'id'>, Document {}

const UserProfileSchema = new Schema<IUserProfileDocument>({
    userId: { type: String, required: true, unique: true, index: true },
    targetExam: { type: String, required: true },
    targetYear: { type: Number, default: 2026 },
    dailyTimeAvailability: { type: Number, required: true, default: 120 },
    currentLevel: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    preferredLanguage: { type: String, default: 'English' }
}, { 
    timestamps: true 
});

export const UserProfileModel = mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema);
