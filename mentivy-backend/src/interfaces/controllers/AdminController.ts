import { Request, Response } from 'express';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';
import { QuestionModel } from '../../infrastructure/database/models/QuestionModel';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';

export class AdminController {
    // ---- Stats ----
    static async getStats(req: Request, res: Response): Promise<void> {
        try {
            const [totalStudents, totalQuestions, totalTopics, totalAttempts] = await Promise.all([
                UserModel.countDocuments({ role: 'STUDENT' }),
                QuestionModel.countDocuments(),
                TopicModel.countDocuments(),
                UserAttemptModel.countDocuments(),
            ]);

            res.status(200).json({
                success: true,
                data: {
                    totalStudents,
                    totalQuestions,
                    totalTopics,
                    totalAttempts,
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- Topics ----
    static async getTopics(req: Request, res: Response): Promise<void> {
        try {
            const topics = await TopicModel.find().sort({ subjectName: 1, name: 1 });
            res.status(200).json({ success: true, data: topics });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async createTopic(req: Request, res: Response): Promise<void> {
        try {
            const { subjectName, name, weightage } = req.body;
            if (!subjectName || !name) {
                res.status(400).json({ success: false, message: 'subjectName and name are required' });
                return;
            }
            const topic = await TopicModel.create({ subjectName, name, weightage: weightage || 5 });
            res.status(201).json({ success: true, data: topic });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async deleteTopic(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await TopicModel.findByIdAndDelete(id);
            // Optionally delete all questions associated with this topic
            await QuestionModel.deleteMany({ topicId: id });
            res.status(200).json({ success: true, message: 'Topic deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- Questions ----
    static async getQuestions(req: Request, res: Response): Promise<void> {
        try {
            const { topicId } = req.query;
            const filter = typeof topicId === 'string' ? { topicId } : {};
            const questions = await QuestionModel.find(filter).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: questions });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async createQuestion(req: Request, res: Response): Promise<void> {
        try {
            const { topicId, difficulty, content, options, correctOptionIndex, explanation, tags } = req.body;
            if (!topicId || !content || !options || correctOptionIndex === undefined) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }
            const question = await QuestionModel.create({
                topicId,
                difficulty: difficulty || 3,
                content,
                options,
                correctOptionIndex,
                explanation: explanation || '',
                tags: tags || []
            });
            res.status(201).json({ success: true, data: question });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async deleteQuestion(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await QuestionModel.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Question deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
