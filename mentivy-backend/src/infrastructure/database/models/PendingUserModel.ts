import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingUserDocument extends Document {
    fullName: string;
    email: string;
    passwordHash: string;
    phoneNumber?: string;
    emailOtp: string;
    emailOtpExpiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PendingUserSchema = new Schema<IPendingUserDocument>({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String },
    emailOtp: { type: String, required: true },
    emailOtpExpiresAt: { type: Date, required: true }
}, {
    timestamps: true
});

// TTL Index: Automatically expire & delete document 10 minutes (600 seconds) after creation
PendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export const PendingUserModel = mongoose.model<IPendingUserDocument>('PendingUser', PendingUserSchema);
