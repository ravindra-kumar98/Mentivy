import mongoose, { Schema, Document } from 'mongoose';
import { Question } from '../../../domain/entities/Question';

export interface IQuestionDocument extends Omit<Question, 'id'>, Document {}

const QuestionSchema = new Schema<IQuestionDocument>({
    topicId: { type: String, required: true, index: true },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String },
    tags: [{ type: String, index: true }]
}, { 
    timestamps: true 
});

// Compound index for finding questions by topic and difficulty fast
QuestionSchema.index({ topicId: 1, difficulty: 1 });

export const QuestionModel = mongoose.model<IQuestionDocument>('Question', QuestionSchema);
