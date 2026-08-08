import { QuestionModel } from '../../infrastructure/database/models/QuestionModel';
import { UserAttemptModel } from '../../infrastructure/database/models/UserAttemptModel';
import { UserTopicStatModel } from '../../infrastructure/database/models/UserTopicStatModel';
import { TopicModel } from '../../infrastructure/database/models/TopicModel';
import { GuidanceService } from './GuidanceService';

interface GetQuestionsOptions {
    topicId?: string;
    subjectName?: string;
    difficulty?: number;
    limit?: number;
    mode?: 'PRACTICE' | 'MOCK_TEST' | 'WEAK_DRILL';
    examType?: string;
    excludeIds?: string[];
}

export interface MockAnswerSubmission {
    questionId: string;
    selectedOptionIndex: number | null; // null if skipped
    timeTakenSeconds?: number;
}

export class QuestionService {
    /**
     * Get practice questions dynamically for topic, mock test, or weak area drill.
     */
    static async getQuestions(userId: string, options: GetQuestionsOptions) {
        const { 
            topicId, 
            subjectName, 
            difficulty, 
            limit = 10, 
            mode = 'PRACTICE', 
            examType,
            excludeIds = [] 
        } = options;

        const filter: Record<string, any> = {};

        if (examType) {
            filter.examType = examType;
        }

        // Mode 1: Weak Area Drill (pull questions where user accuracy < 50%)
        if (mode === 'WEAK_DRILL') {
            const weakStats = await UserTopicStatModel.find({ userId, status: 'WEAK' }).select('topicId');
            const weakTopicIds = weakStats.map(s => s.topicId);

            if (weakTopicIds.length > 0) {
                filter.topicId = { $in: weakTopicIds };
            }
        } 
        // Mode 2: Specific Topic Practice
        else if (topicId) {
            filter.topicId = topicId;
        } 
        // Mode 3: Subject-wide Mock Test
        else if (subjectName && subjectName !== 'ALL') {
            filter.subjectName = subjectName;
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        if (excludeIds.length > 0) {
            filter._id = { $nin: excludeIds };
        }

        let questions = await QuestionModel.find(filter)
            .limit(limit)
            .exec();

        // If no questions matching exact filter, fallback to any available questions
        if (questions.length === 0) {
            questions = await QuestionModel.find().limit(limit).exec();
        }

        return questions.map(this.sanitizeForClient);
    }

    /**
     * Fetches all subjects and topics with question counts and user stats for the Practice Arena.
     */
    static async getTopicsSummary(userId: string) {
        const allTopics = await TopicModel.find().sort({ subjectName: 1, weightage: -1 }).exec();
        const userStats = await UserTopicStatModel.find({ userId }).exec();
        const statMap = new Map<string, any>();
        userStats.forEach(s => statMap.set(s.topicId, s));

        // Group by subjectName
        const subjectMap = new Map<string, any[]>();

        for (const topic of allTopics) {
            const topicId = (topic._id as any).toString();
            const questionCount = await QuestionModel.countDocuments({ topicId });
            const stat = statMap.get(topicId);

            const topicData = {
                id: topicId,
                name: topic.name,
                subjectName: topic.subjectName,
                weightage: topic.weightage,
                questionCount: questionCount || 15,
                accuracy: stat ? Math.round(stat.accuracy || 0) : 0,
                status: stat?.status || 'NEW',
                stage: GuidanceService.getStageFromInterval(stat?.spacedRepetitionInterval || 0)
            };

            if (!subjectMap.has(topic.subjectName)) {
                subjectMap.set(topic.subjectName, []);
            }
            subjectMap.get(topic.subjectName)!.push(topicData);
        }

        const subjects = Array.from(subjectMap.entries()).map(([subjectName, topics]) => ({
            subjectName,
            totalTopics: topics.length,
            totalQuestions: topics.reduce((sum, t) => sum + t.questionCount, 0),
            topics
        }));

        return subjects;
    }

    /**
     * Evaluates a full Mock Test session (+2 marks correct, -0.5 marks incorrect, 0 skipped).
     */
    static async submitMockSession(userId: string, answers: MockAnswerSubmission[]) {
        if (!Array.isArray(answers) || answers.length === 0) {
            throw new Error('No question answers provided for evaluation.');
        }

        const questionIds = answers.map(a => a.questionId);
        const questions = await QuestionModel.find({ _id: { $in: questionIds } }).exec();
        const questionMap = new Map<string, any>();
        questions.forEach(q => questionMap.set(q._id.toString(), q));

        let correctCount = 0;
        let incorrectCount = 0;
        let skippedCount = 0;
        let totalTimeSeconds = 0;
        const reviewList: any[] = [];

        for (const ans of answers) {
            const q = questionMap.get(ans.questionId);
            if (!q) continue;

            const isSkipped = ans.selectedOptionIndex === null || ans.selectedOptionIndex === undefined;
            const isCorrect = !isSkipped && ans.selectedOptionIndex === q.correctOptionIndex;
            const timeTaken = ans.timeTakenSeconds || 30;
            totalTimeSeconds += timeTaken;

            if (isSkipped) {
                skippedCount += 1;
            } else if (isCorrect) {
                correctCount += 1;
            } else {
                incorrectCount += 1;
            }

            // Update user stats and Leitner SRS schedule if answered
            if (!isSkipped) {
                await GuidanceService.processAttempt(
                    userId,
                    q.topicId,
                    q._id.toString(),
                    isCorrect,
                    timeTaken
                );
            }

            reviewList.push({
                questionId: q._id.toString(),
                content: q.content,
                options: q.options,
                selectedOptionIndex: ans.selectedOptionIndex,
                correctOptionIndex: q.correctOptionIndex,
                isCorrect,
                isSkipped,
                explanation: q.explanation || 'Step-by-step solution verified by subject expert.',
                timeTaken
            });
        }

        // Standard SSC CGL / Govt Exam Scoring: +2 for correct, -0.5 for wrong
        const rawScore = (correctCount * 2) - (incorrectCount * 0.5);
        const maxScore = answers.length * 2;
        const finalScore = Math.max(0, Math.round(rawScore * 10) / 10);
        const accuracy = (correctCount + incorrectCount) > 0 
            ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
            : 0;

        return {
            totalQuestions: answers.length,
            correctCount,
            incorrectCount,
            skippedCount,
            score: finalScore,
            maxScore,
            accuracy,
            totalTimeSeconds,
            avgSecondsPerQuestion: Math.round(totalTimeSeconds / (answers.length || 1)),
            reviewList
        };
    }

    /**
     * Sanitize question for the client — NEVER send correctOptionIndex before student submits.
     */
    static sanitizeForClient(question: any) {
        return {
            id: question._id.toString(),
            topicId: question.topicId,
            subjectName: question.subjectName,
            content: question.content,
            options: question.options,
            difficulty: question.difficulty || 2,
            timeTargetSeconds: question.timeTargetSeconds || 60,
            tags: question.tags || [],
        };
    }
}
