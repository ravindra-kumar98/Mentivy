import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'SRS_REVISION' | 'WEAK_ALERT' | 'STREAK_GOAL' | 'MOCK_RESULT' | 'ANNOUNCEMENT';

export interface INotificationDocument extends Document {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>({
    userId: { type: String, required: true, index: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['SRS_REVISION', 'WEAK_ALERT', 'STREAK_GOAL', 'MOCK_RESULT', 'ANNOUNCEMENT'],
        default: 'SRS_REVISION'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    actionUrl: { type: String },
    actionLabel: { type: String, default: 'View Details' },
    isRead: { type: Boolean, default: false, index: true }
}, {
    timestamps: true
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
