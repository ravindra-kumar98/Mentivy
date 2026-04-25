import mongoose, { Schema, Document } from 'mongoose';
import { Topic } from '../../../domain/entities/Topic';

export interface ITopicDocument extends Omit<Topic, 'id'>, Document {}

const TopicSchema = new Schema<ITopicDocument>({
    subjectName: { type: String, required: true, index: true },
    name: { type: String, required: true },
    weightage: { type: Number, required: true, min: 1, max: 10, default: 5 }
}, { 
    timestamps: true 
});

export const TopicModel = mongoose.model<ITopicDocument>('Topic', TopicSchema);
