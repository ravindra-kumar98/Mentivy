import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User';

export interface IUserDocument extends Omit<User, 'id'>, Document {}

const UserSchema = new Schema<IUserDocument>({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
    phoneNumber: { type: String },
    avatarUrl: { type: String },
    googleId: { type: String, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    emailOtpExpiresAt: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpiresAt: { type: Date }
}, { 
    timestamps: true 
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
