import mongoose, { Schema, Document } from 'mongoose';
import { Question } from '../../../domain/entities/Question';

export interface IQuestionDocument extends Omit<Question, 'id'>, Document {
    subjectName?: string;
    examType?: string;
    timeTargetSeconds?: number;
}

const QuestionSchema = new Schema<IQuestionDocument>({
    topicId: { type: String, required: true, index: true },
    subjectName: { type: String, index: true },
    examType: { type: String, index: true, default: 'SSC CGL' },
    difficulty: { type: Number, required: true, min: 1, max: 5, default: 2 },
    content: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String },
    timeTargetSeconds: { type: Number, default: 60 },
    tags: [{ type: String, index: true }]
}, { 
    timestamps: true 
});

// Compound index for finding questions by topic and difficulty fast
QuestionSchema.index({ topicId: 1, difficulty: 1 });
QuestionSchema.index({ subjectName: 1, examType: 1 });

export const QuestionModel = mongoose.model<IQuestionDocument>('Question', QuestionSchema);
