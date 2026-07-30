import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User';

export interface IUserDocument extends Omit<User, 'id'>, Document {}

const UserSchema = new Schema<IUserDocument>({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
    phoneNumber: { type: String },
    avatarUrl: { type: String }
}, { 
    timestamps: true 
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
