import { Request, Response } from 'express';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';
import { QuestionModel } from '../../infrastructure/database/models/QuestionModel';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';
import { UserProfileModel } from '../../infrastructure/database/models/UserProfileModel';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AdminController {
    // ---- Stats (Scoped for Teacher, Global for Super Admin) ----
    static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const isTeacher = user?.role === 'ADMIN';
            const assignedFields = user?.assignedFields || [];

            if (isTeacher) {
                const teacherTopics = await TopicModel.find({ subjectName: { $in: assignedFields } }).select('_id');
                const topicIds: string[] = teacherTopics.map(t => (t._id as any).toString());

                const [totalQuestions, totalStudents, totalAttempts] = await Promise.all([
                    QuestionModel.countDocuments({ topicId: { $in: topicIds } }),
                    UserModel.countDocuments({ role: 'STUDENT' }),
                    UserAttemptModel.countDocuments(),
                ]);

                res.status(200).json({
                    success: true,
                    data: {
                        totalStudents,
                        totalQuestions,
                        totalTopics: teacherTopics.length,
                        totalAttempts,
                        role: 'ADMIN',
                        assignedFields
                    }
                });
                return;
            }

            // Super Admin gets complete platform stats
            const [totalStudents, totalAdmins, totalQuestions, totalTopics, totalAttempts] = await Promise.all([
                UserModel.countDocuments({ role: 'STUDENT' }),
                UserModel.countDocuments({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } }),
                QuestionModel.countDocuments(),
                TopicModel.countDocuments(),
                UserAttemptModel.countDocuments(),
            ]);

            res.status(200).json({
                success: true,
                data: {
                    totalStudents,
                    totalAdmins,
                    totalQuestions,
                    totalTopics,
                    totalAttempts,
                    role: 'SUPER_ADMIN'
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- Get Available Subject Fields ----
    static async getAvailableFields(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const defaultSubjects = [
                'Quantitative Aptitude',
                'Mathematics',
                'Physics',
                'Chemistry',
                'Biology',
                'Logical Reasoning',
                'Verbal Ability'
            ];

            const dbSubjects = await TopicModel.distinct('subjectName');
            const allUnique = Array.from(new Set([...defaultSubjects, ...dbSubjects])).filter(Boolean).sort();

            const user = req.user;
            const available = user?.role === 'ADMIN' 
                ? (user.assignedFields || []) 
                : allUnique;

            res.status(200).json({
                success: true,
                data: {
                    fields: available,
                    allFields: allUnique,
                    userRole: user?.role
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- Topics (Subject-Scoped) ----
    static async getTopics(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const filter: any = {};

            // If teacher, strictly restrict to their assigned subject fields
            if (user?.role === 'ADMIN') {
                filter.subjectName = { $in: user.assignedFields || [] };
            }

            const topics = await TopicModel.find(filter).sort({ subjectName: 1, name: 1 });
            res.status(200).json({ success: true, data: topics });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async createTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { subjectName, name, weightage } = req.body;
            if (!subjectName || !name) {
                res.status(400).json({ success: false, message: 'subjectName and name are required' });
                return;
            }

            const user = req.user;
            if (user?.role === 'ADMIN' && !(user.assignedFields || []).includes(subjectName.trim())) {
                res.status(403).json({
                    success: false,
                    message: `You do not have permission to create topics in "${subjectName}". Assigned fields: ${(user.assignedFields || []).join(', ')}`
                });
                return;
            }

            const topic = await TopicModel.create({
                subjectName: subjectName.trim(),
                name: name.trim(),
                weightage: weightage || 5
            });

            res.status(201).json({ success: true, data: topic });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async updateTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { subjectName, name, weightage } = req.body;
            const user = req.user;

            const existing = await TopicModel.findById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Topic not found' });
                return;
            }

            if (user?.role === 'ADMIN' && !(user.assignedFields || []).includes(existing.subjectName)) {
                res.status(403).json({ success: false, message: 'You do not have permission to edit this topic.' });
                return;
            }

            if (user?.role === 'ADMIN' && subjectName && !(user.assignedFields || []).includes(subjectName.trim())) {
                res.status(403).json({ success: false, message: 'Cannot move topic to an unassigned subject field.' });
                return;
            }

            const updated = await TopicModel.findByIdAndUpdate(
                id,
                {
                    subjectName: subjectName ? subjectName.trim() : existing.subjectName,
                    name: name ? name.trim() : existing.name,
                    weightage: weightage || 5
                },
                { new: true }
            );

            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async deleteTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user;

            const existing = await TopicModel.findById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Topic not found' });
                return;
            }

            if (user?.role === 'ADMIN' && !(user.assignedFields || []).includes(existing.subjectName)) {
                res.status(403).json({ success: false, message: 'You do not have permission to delete this topic.' });
                return;
            }

            await TopicModel.findByIdAndDelete(id);
            await QuestionModel.deleteMany({ topicId: id });
            res.status(200).json({ success: true, message: 'Topic deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- Questions (Subject-Scoped) ----
    static async getQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { topicId, search, difficulty } = req.query;
            const user = req.user;
            const filter: any = {};

            if (typeof topicId === 'string' && topicId.trim()) {
                const topic = await TopicModel.findById(topicId.trim());
                if (topic && user?.role === 'ADMIN' && !(user.assignedFields || []).includes(topic.subjectName)) {
                    res.status(403).json({ success: false, message: 'Access denied to this subject field.' });
                    return;
                }
                filter.topicId = topicId.trim();
            } else if (user?.role === 'ADMIN') {
                const teacherTopics = await TopicModel.find({ subjectName: { $in: user.assignedFields || [] } }).select('_id');
                filter.topicId = { $in: teacherTopics.map(t => (t._id as any).toString()) };
            }

            if (typeof difficulty === 'string' && difficulty.trim()) {
                const diffNum = parseInt(difficulty);
                if (!isNaN(diffNum)) {
                    filter.difficulty = diffNum;
                }
            }

            if (typeof search === 'string' && search.trim()) {
                filter.$or = [
                    { content: { $regex: search.trim(), $options: 'i' } },
                    { explanation: { $regex: search.trim(), $options: 'i' } },
                    { tags: { $in: [new RegExp(search.trim(), 'i')] } }
                ];
            }

            const questions = await QuestionModel.find(filter).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: questions });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async createQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { topicId, difficulty, content, options, correctOptionIndex, explanation, tags } = req.body;
            if (!topicId || !content || !options || correctOptionIndex === undefined) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }

            const user = req.user;
            if (user?.role === 'ADMIN') {
                const topic = await TopicModel.findById(topicId);
                if (!topic || !(user.assignedFields || []).includes(topic.subjectName)) {
                    res.status(403).json({ success: false, message: 'You do not have permission to add questions to this subject.' });
                    return;
                }
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

    static async updateQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { topicId, difficulty, content, options, correctOptionIndex, explanation, tags } = req.body;
            const user = req.user;

            const existing = await QuestionModel.findById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Question not found' });
                return;
            }

            if (user?.role === 'ADMIN') {
                const topic = await TopicModel.findById(existing.topicId);
                if (!topic || !(user.assignedFields || []).includes(topic.subjectName)) {
                    res.status(403).json({ success: false, message: 'You do not have permission to edit this question.' });
                    return;
                }
            }

            const updated = await QuestionModel.findByIdAndUpdate(
                id,
                {
                    topicId,
                    difficulty: difficulty || 3,
                    content,
                    options,
                    correctOptionIndex,
                    explanation: explanation || '',
                    tags: tags || []
                },
                { new: true }
            );

            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    static async deleteQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user;

            const existing = await QuestionModel.findById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Question not found' });
                return;
            }

            if (user?.role === 'ADMIN') {
                const topic = await TopicModel.findById(existing.topicId);
                if (!topic || !(user.assignedFields || []).includes(topic.subjectName)) {
                    res.status(403).json({ success: false, message: 'You do not have permission to delete this question.' });
                    return;
                }
            }

            await QuestionModel.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Question deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- Bulk Question Import (Subject-Scoped) ----
    static async bulkImportQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { topicId, questions } = req.body;
            if (!topicId) {
                res.status(400).json({ success: false, message: 'topicId is required' });
                return;
            }
            if (!Array.isArray(questions) || questions.length === 0) {
                res.status(400).json({ success: false, message: 'questions array is required and must not be empty' });
                return;
            }

            const user = req.user;
            const topic = await TopicModel.findById(topicId);
            if (!topic) {
                res.status(404).json({ success: false, message: 'Topic not found' });
                return;
            }

            if (user?.role === 'ADMIN' && !(user.assignedFields || []).includes(topic.subjectName)) {
                res.status(403).json({ success: false, message: 'You do not have permission to import questions to this subject field.' });
                return;
            }

            const validQuestions: any[] = [];
            const errors: string[] = [];

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.content || typeof q.content !== 'string' || !q.content.trim()) {
                    errors.push(`Row ${i + 1}: Missing question content`);
                    continue;
                }
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    errors.push(`Row ${i + 1}: Question must have at least 2 options`);
                    continue;
                }
                const correctIdx = Number(q.correctOptionIndex);
                if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= q.options.length) {
                    errors.push(`Row ${i + 1}: Invalid correctOptionIndex (${q.correctOptionIndex})`);
                    continue;
                }

                validQuestions.push({
                    topicId,
                    content: q.content.trim(),
                    options: q.options.map((opt: any) => String(opt).trim()),
                    correctOptionIndex: correctIdx,
                    explanation: q.explanation ? String(q.explanation).trim() : '',
                    difficulty: q.difficulty ? Math.min(5, Math.max(1, Number(q.difficulty))) : 3,
                    tags: Array.isArray(q.tags) 
                        ? q.tags.map((t: any) => String(t).trim()).filter(Boolean)
                        : (typeof q.tags === 'string' ? q.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [])
                });
            }

            if (validQuestions.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'No valid questions found to import',
                    errors
                });
                return;
            }

            const inserted = await QuestionModel.insertMany(validQuestions);
            res.status(201).json({
                success: true,
                data: {
                    importedCount: inserted.length,
                    errorsCount: errors.length,
                    errors
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- User Directory (Teachers see Students only; Super Admin sees all) ----
    static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const { search, role, page = '1', limit = '50' } = req.query;
            const filter: any = {};

            // If teacher (ADMIN), strictly restrict directory to STUDENTS only
            if (user?.role === 'ADMIN') {
                filter.role = 'STUDENT';
            } else if (typeof role === 'string' && role.trim() && role !== 'ALL') {
                filter.role = role.trim();
            }

            if (typeof search === 'string' && search.trim()) {
                filter.$or = [
                    { fullName: { $regex: search.trim(), $options: 'i' } },
                    { email: { $regex: search.trim(), $options: 'i' } },
                    { phoneNumber: { $regex: search.trim(), $options: 'i' } }
                ];
            }

            const pageNum = Math.max(1, parseInt(page as string) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
            const skip = (pageNum - 1) * limitNum;

            const [totalUsers, rawUsers] = await Promise.all([
                UserModel.countDocuments(filter),
                UserModel.find(filter)
                    .select('-passwordHash')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean()
            ]);

            const userIds = rawUsers.map(u => u._id.toString());
            const [profiles, attempts] = await Promise.all([
                UserProfileModel.find({ userId: { $in: userIds } }).lean(),
                UserAttemptModel.aggregate([
                    { $match: { userId: { $in: userIds } } },
                    { $group: { _id: '$userId', count: { $sum: 1 } } }
                ])
            ]);

            const profileMap = new Map(profiles.map(p => [p.userId, p]));
            const attemptMap = new Map(attempts.map(a => [a._id, a.count]));

            const users = rawUsers.map(u => {
                const profile = profileMap.get(u._id.toString());
                const attemptCount = attemptMap.get(u._id.toString()) || 0;
                return {
                    id: u._id,
                    fullName: u.fullName,
                    email: u.email,
                    role: u.role,
                    assignedFields: u.assignedFields || [],
                    avatarUrl: u.avatarUrl,
                    phoneNumber: u.phoneNumber,
                    isEmailVerified: u.isEmailVerified,
                    createdAt: u.createdAt,
                    targetExam: profile?.targetExam || 'Not set',
                    targetYear: profile?.targetYear || 2026,
                    currentLevel: profile?.currentLevel || 'BEGINNER',
                    attemptCount
                };
            });

            res.status(200).json({
                success: true,
                data: {
                    users,
                    totalUsers,
                    page: pageNum,
                    totalPages: Math.ceil(totalUsers / limitNum),
                    callerRole: user?.role
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // ---- Super Admin Only: Promote / Demote and Assign Subject Fields ----
    static async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { role, assignedFields } = req.body;

            if (!role || !['STUDENT', 'ADMIN'].includes(role)) {
                res.status(400).json({ success: false, message: 'Target role must be STUDENT or ADMIN' });
                return;
            }

            const targetUser = await UserModel.findById(id);
            if (!targetUser) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            // Prevent changing Super Admin role
            if (targetUser.role === 'SUPER_ADMIN') {
                res.status(400).json({ success: false, message: 'Cannot modify permissions for Super Admin account.' });
                return;
            }

            const fields = Array.isArray(assignedFields) 
                ? assignedFields.map(f => String(f).trim()).filter(Boolean)
                : [];

            const updated = await UserModel.findByIdAndUpdate(
                id,
                { 
                    role,
                    assignedFields: role === 'ADMIN' ? fields : []
                },
                { new: true }
            ).select('-passwordHash');

            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
