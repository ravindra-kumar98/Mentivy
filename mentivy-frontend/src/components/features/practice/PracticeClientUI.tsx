'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Trophy, 
  AlertCircle, 
  ArrowLeft, 
  Bookmark, 
  Zap, 
  BookOpen, 
  Flag, 
  ListOrdered, 
  Sparkles, 
  Filter, 
  ArrowRight, 
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface TopicItem {
  id: string;
  name: string;
  subjectName: string;
  weightage: number;
  questionCount: number;
  accuracy: number;
  status: 'NEW' | 'WEAK' | 'AVERAGE' | 'STRONG';
  stage: number;
}

export interface SubjectGroup {
  subjectName: string;
  totalTopics: number;
  totalQuestions: number;
  topics: TopicItem[];
}

export interface Question {
  id: string;
  topicId: string;
  subjectName?: string;
  content: string;
  options: string[];
  difficulty?: number;
  tags?: string[];
  timeTargetSeconds?: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
  userStatus: 'WEAK' | 'AVERAGE' | 'STRONG';
  accuracy: number;
}

export interface QuestionReviewItem {
  questionId: string;
  content: string;
  options: string[];
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean;
  isSkipped: boolean;
  explanation: string;
  timeTaken?: number;
}

export interface MockScorecard {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  score: number;
  maxScore: number;
  accuracy: number;
  totalTimeSeconds: number;
  avgSecondsPerQuestion: number;
  reviewList: QuestionReviewItem[];
}

export type PracticeMode = 'PRACTICE' | 'MOCK_TEST' | 'WEAK_DRILL';
export type ViewState = 'HUB' | 'ACTIVE_QUIZ' | 'SCORECARD';

interface PracticeClientUIProps {
  initialTopics: SubjectGroup[];
}

export default function PracticeClientUI({ initialTopics = [] }: PracticeClientUIProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTopicId = searchParams.get('topicId') || '';
  const urlTopicName = searchParams.get('topicName') || '';
  const urlMode = (searchParams.get('mode') as PracticeMode) || 'PRACTICE';

  const [viewState, setViewState] = useState<ViewState>(urlTopicId || searchParams.get('mode') ? 'ACTIVE_QUIZ' : 'HUB');
  const [mode, setMode] = useState<PracticeMode>(urlMode);
  const [topicId, setTopicId] = useState(urlTopicId);
  const [topicName, setTopicName] = useState(urlTopicName || 'Practice Session');

  // Hub topics state initialized with SSR data
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>(initialTopics);
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<string>('ALL');

  // Active Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number | null>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [singleAnswerResult, setSingleAnswerResult] = useState<AnswerResult | null>(null);
  const [mockScorecard, setMockScorecard] = useState<MockScorecard | null>(null);

  // Timers & Stats
  const [timer, setTimer] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quickScore, setQuickScore] = useState({ correct: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'SKIPPED'>('ALL');

  // Fetch updated topics if initial array was empty
  useEffect(() => {
    if (initialTopics.length === 0) {
      apiClient.get('/questions/topics')
        .then(res => {
          if (Array.isArray(res.data?.data)) {
            setSubjectGroups(res.data.data);
          }
        })
        .catch(err => console.error('Failed to load client topics:', err));
    }
  }, [initialTopics]);

  // Start Quiz Session
  const startQuizSession = useCallback(async (selectedTopicId?: string, selectedTopicName?: string, selectedMode?: PracticeMode) => {
    const targetMode = selectedMode || mode;
    const targetTopicId = selectedTopicId !== undefined ? selectedTopicId : topicId;
    const targetTopicName = selectedTopicName || topicName;

    setMode(targetMode);
    setTopicId(targetTopicId);
    setTopicName(targetTopicName);
    setIsQuizLoading(true);
    setErrorMessage('');
    setViewState('ACTIVE_QUIZ');

    const limit = targetMode === 'MOCK_TEST' ? 25 : 10;

    try {
      const params: Record<string, any> = {
        limit,
        mode: targetMode
      };
      if (targetTopicId && targetMode !== 'WEAK_DRILL') {
        params.topicId = targetTopicId;
      }

      const res = await apiClient.get('/questions', { params });
      const data = res.data?.data;

      if (!Array.isArray(data) || data.length === 0) {
        setErrorMessage(`No questions currently available for ${targetTopicName}. Please select another topic from the Arena.`);
        return;
      }

      setQuestions(data);
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setSingleAnswerResult(null);
      setMockScorecard(null);
      setQuickScore({ correct: 0, total: 0 });
      setStreak(0);
      setTimer(targetMode === 'MOCK_TEST' ? 25 * 60 : 0);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to load questions.');
    } finally {
      setIsQuizLoading(false);
    }
  }, [mode, topicId, topicName]);

  // Sync if URL search params change
  useEffect(() => {
    if (urlTopicId || searchParams.get('mode')) {
      startQuizSession(urlTopicId, urlTopicName || 'Practice Session', urlMode);
    }
  }, [urlTopicId, urlTopicName, urlMode, startQuizSession]);

  // Live Timer Interval
  useEffect(() => {
    if (viewState !== 'ACTIVE_QUIZ' || isQuizLoading || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (mode === 'MOCK_TEST') {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitMockTest();
            return 0;
          }
          return prev - 1;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [viewState, isQuizLoading, questions.length, mode]);

  // Option Selection
  const handleSelectOption = async (optionIndex: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setUserAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));

    if (mode === 'PRACTICE' || mode === 'WEAK_DRILL') {
      try {
        const checkRes = await apiClient.post('/questions/check', {
          questionId: currentQ.id,
          selectedOptionIndex: optionIndex,
          topicId: currentQ.topicId || topicId,
          timeTaken: timer
        });
        const result: AnswerResult = checkRes.data.data;
        setSingleAnswerResult(result);

        if (result.isCorrect) {
          setQuickScore(s => ({ ...s, correct: s.correct + 1, total: s.total + 1 }));
          setStreak(st => st + 1);
        } else {
          setQuickScore(s => ({ ...s, total: s.total + 1 }));
          setStreak(0);
        }
      } catch (err) {
        setQuickScore(s => ({ ...s, total: s.total + 1 }));
      }
    }
  };

  const toggleFlagCurrentQuestion = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      if (mode === 'MOCK_TEST') {
        handleSubmitMockTest();
      } else {
        setViewState('SCORECARD');
      }
    } else {
      setCurrentIndex(i => i + 1);
      setSingleAnswerResult(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setSingleAnswerResult(null);
    }
  };

  // Submit Mock Test
  const handleSubmitMockTest = async () => {
    setIsQuizLoading(true);
    try {
      const answersPayload = questions.map((q, idx) => ({
        questionId: q.id,
        selectedOptionIndex: userAnswers[idx] !== undefined ? userAnswers[idx] : null,
        timeTakenSeconds: 45
      }));

      const res = await apiClient.post('/practice/submit-mock', {
        answers: answersPayload
      });

      setMockScorecard(res.data.data);
      setViewState('SCORECARD');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit mock test.');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Filter topics in hub
  const filteredSubjectGroups = selectedSubjectTab === 'ALL'
    ? subjectGroups
    : subjectGroups.filter(g => g.subjectName.toLowerCase() === selectedSubjectTab.toLowerCase());

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PRACTICE HUB VIEW (Landing Screen)
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewState === 'HUB') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                Practice Arena
              </span>
              <span className="text-xs text-slate-400 font-medium">• SSC CGL, UPSC & Banking Ready</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interactive Question Studio</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a test mode or choose any topic to launch instant AI-guided practice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => startQuizSession('', 'Full Timed Mock Test', 'MOCK_TEST')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm shadow-md shadow-primary-500/25 transition cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Start 25-Min Mock Test</span>
            </button>
          </div>
        </div>

        {/* 3 Core Practice Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Mode 1: Quick Practice */}
          <div 
            onClick={() => startQuizSession('', 'Daily Quick Drill', 'PRACTICE')}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="p-3.5 bg-primary-50 text-primary-600 rounded-2xl border border-primary-100 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 fill-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
              Daily Quick Drill
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              10 rapid-fire questions with instant step-by-step AI derivations, formulas, and concepts.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-primary-600">
              <span>Start Quick Drill</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Mode 2: Timed Mock Test */}
          <div 
            onClick={() => startQuizSession('', 'Full Timed Mock Test', 'MOCK_TEST')}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
              Full Timed Mock Test
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              25-minute exam simulation with live countdown, question palette, and official +2 / -0.5 marking.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-primary-600">
              <span>Launch Mock Test</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Mode 3: Weak Areas Booster */}
          <div 
            onClick={() => startQuizSession('', 'Weak Areas Revision', 'WEAK_DRILL')}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              Weak Areas Booster
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Targeted drills focusing exclusively on questions you previously answered incorrectly.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-orange-600">
              <span>Practice Weak Topics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Subject Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Subject:</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedSubjectTab('ALL')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition shrink-0",
              selectedSubjectTab === 'ALL'
                ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            All Subjects
          </button>

          {subjectGroups.map(g => (
            <button
              key={g.subjectName}
              type="button"
              onClick={() => setSelectedSubjectTab(g.subjectName)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition shrink-0",
                selectedSubjectTab === g.subjectName
                  ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {g.subjectName} ({g.topics.length})
            </button>
          ))}
        </div>

        {/* Topic Grid by Subject */}
        <div className="space-y-8">
          {filteredSubjectGroups.map(group => (
            <div key={group.subjectName} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  <h3 className="font-bold text-slate-900 text-base">{group.subjectName}</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {group.topics.length} Topics • {group.totalQuestions} Questions Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.topics.map(topic => (
                  <div
                    key={topic.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-primary-300 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Weightage: {topic.weightage}/10
                        </span>
                        {topic.accuracy > 0 && (
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-md",
                            topic.accuracy >= 70 ? "bg-emerald-50 text-emerald-700" :
                            topic.accuracy >= 40 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                          )}>
                            {topic.accuracy}% Accuracy
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-primary-600 transition-colors">
                        {topic.name}
                      </h4>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {topic.questionCount} Questions
                      </span>
                      <button
                        type="button"
                        onClick={() => startQuizSession(topic.id, topic.name, 'PRACTICE')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 group-hover:text-primary-700 cursor-pointer"
                      >
                        <span>Practice</span>
                        <Play className="w-3 h-3 fill-primary-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. FINISHED SCORECARD VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewState === 'SCORECARD') {
    if (mode === 'MOCK_TEST' && mockScorecard) {
      const filteredReviews = mockScorecard.reviewList.filter(item => {
        if (reviewFilter === 'CORRECT') return item.isCorrect;
        if (reviewFilter === 'INCORRECT') return !item.isCorrect && !item.isSkipped;
        if (reviewFilter === 'SKIPPED') return item.isSkipped;
        return true;
      });

      const isPass = mockScorecard.accuracy >= 60;

      return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6">
            <div className={cn(
              "w-20 h-20 rounded-full mx-auto flex items-center justify-center border-2 shadow-sm",
              isPass ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-orange-50 border-orange-200 text-orange-600"
            )}>
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mock Test Scorecard</h2>
              <p className="text-sm text-slate-500">
                Official competitive marking: <strong className="text-slate-700">+2 / -0.5</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-4">
                <p className="text-3xl font-black text-primary-700">{mockScorecard.score}</p>
                <p className="text-[11px] font-bold text-primary-600/80 uppercase tracking-wider mt-0.5">Total Marks / {mockScorecard.maxScore}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-3xl font-black text-emerald-600">{mockScorecard.accuracy}%</p>
                <p className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-wider mt-0.5">Accuracy</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-3xl font-black text-slate-900">{mockScorecard.correctCount}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Correct</p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-3xl font-black text-red-600">{mockScorecard.incorrectCount}</p>
                <p className="text-[11px] font-bold text-red-600/80 uppercase tracking-wider mt-0.5">Incorrect (-{mockScorecard.incorrectCount * 0.5})</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button variant="outline" className="rounded-xl px-6" onClick={() => setViewState('HUB')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Practice Arena
              </Button>
              <Button className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl px-8 shadow-md shadow-primary-500/25" onClick={() => startQuizSession(topicId, topicName, mode)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retake Mock Test
              </Button>
            </div>
          </div>

          {/* Question-by-Question Review Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Question-by-Question Review</h3>
                <p className="text-xs text-slate-500">Step-by-step solutions and answers analysis</p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'CORRECT', 'INCORRECT', 'SKIPPED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer",
                      reviewFilter === f ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredReviews.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400">Question #{idx + 1}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider",
                      item.isCorrect ? "bg-emerald-100 text-emerald-800" :
                      item.isSkipped ? "bg-slate-200 text-slate-700" : "bg-red-100 text-red-800"
                    )}>
                      {item.isCorrect ? '✅ Correct (+2)' : item.isSkipped ? '⚪ Skipped (0)' : '❌ Incorrect (-0.5)'}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{item.content}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                    {item.options.map((opt, oIdx) => {
                      const isCorrectAnswer = oIdx === item.correctOptionIndex;
                      const isUserChoice = oIdx === item.selectedOptionIndex;

                      return (
                        <div
                          key={oIdx}
                          className={cn(
                            "p-2.5 rounded-xl border flex items-center gap-2",
                            isCorrectAnswer ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold" :
                            isUserChoice && !item.isCorrect ? "bg-red-50 border-red-300 text-red-900 font-bold" :
                            "bg-white border-slate-200 text-slate-600 opacity-75"
                          )}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="bg-white rounded-xl p-3 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-primary-700 block mb-0.5">Solution:</strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      );
    }

    // Quick Practice Drill Summary
    const accuracy = quickScore.total > 0 ? Math.round((quickScore.correct / quickScore.total) * 100) : 0;
    const isPassing = accuracy >= 60;

    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-sm my-8 animate-in fade-in zoom-in-95 duration-300">
        <div className={cn(
          "w-20 h-20 rounded-full mx-auto flex items-center justify-center border-2",
          isPassing ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-orange-50 border-orange-200 text-orange-600"
        )}>
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900">Drill Completed!</h2>
          <p className="text-sm text-slate-500">
            You practised <strong className="text-slate-800">{topicName}</strong>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-3xl font-black text-slate-900">{accuracy}%</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Accuracy</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-3xl font-black text-emerald-600">{quickScore.correct}</p>
            <p className="text-[11px] font-semibold text-emerald-600/70 uppercase tracking-wider mt-0.5">Correct</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-3xl font-black text-slate-900">{quickScore.total}</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Attempted</p>
          </div>
        </div>

        <div className={cn(
          "p-3.5 rounded-2xl border text-xs font-semibold leading-relaxed",
          isPassing 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-orange-50 text-orange-800 border-orange-200"
        )}>
          {isPassing 
            ? '🎉 Mastery verified! Your Spaced Repetition interval has been advanced.' 
            : '⚡ Topic added to your priority revision queue.'}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setViewState('HUB')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Practice Arena
          </Button>
          <Button className="flex-1 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl shadow-md shadow-primary-500/20" onClick={() => startQuizSession(topicId, topicName, mode)}>
            <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ACTIVE QUIZ STUDIO VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (isQuizLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-lg">Preparing Question Studio...</h4>
          <p className="text-slate-400 text-xs mt-0.5">Loading questions for {topicName}</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm my-16">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Session Notice</h3>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="outline" onClick={() => setViewState('HUB')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Arena
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-slate-500">Loading next question...</p>
      </div>
    );
  }

  const currentAnswer = userAnswers[currentIndex];
  const isCurrentFlagged = !!flaggedQuestions[currentIndex];
  const difficultyLevel = currentQuestion.difficulty || 2;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => startQuizSession(topicId, topicName, 'PRACTICE')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5",
              mode === 'PRACTICE' ? "bg-primary-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Practice</span>
          </button>

          <button
            type="button"
            onClick={() => startQuizSession(topicId, 'Full Mock Test', 'MOCK_TEST')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5",
              mode === 'MOCK_TEST' ? "bg-primary-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timed Mock Test</span>
          </button>

          <button
            type="button"
            onClick={() => startQuizSession('', 'Weak Areas Drill', 'WEAK_DRILL')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5",
              mode === 'WEAK_DRILL' ? "bg-primary-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Weak Areas</span>
          </button>
        </div>

        {/* Question Palette Toggle */}
        <button
          type="button"
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
          className={cn(
            "px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center gap-1.5",
            isPaletteOpen ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          <ListOrdered className="w-3.5 h-3.5 text-primary-600" />
          <span>Palette ({questions.length})</span>
        </button>
      </div>

      {/* Question Palette Grid (Collapsible) */}
      {isPaletteOpen && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Question Navigator</span>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Flagged</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Unattempted</span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 gap-2">
            {questions.map((_, idx) => {
              const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== null;
              const isFlagged = !!flaggedQuestions[idx];
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setSingleAnswerResult(null);
                  }}
                  className={cn(
                    "w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border-2",
                    isCurrent ? "ring-2 ring-primary-500 ring-offset-2" : "",
                    isFlagged ? "bg-purple-50 border-purple-400 text-purple-800" :
                    isAnswered ? "bg-emerald-50 border-emerald-400 text-emerald-800" :
                    "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Question Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <button 
          type="button"
          onClick={() => setViewState('HUB')} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 cursor-pointer transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="truncate max-w-[140px] sm:max-w-xs">{topicName}</span>
        </button>

        <div className="flex items-center gap-3">
          {streak > 1 && mode !== 'MOCK_TEST' && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-bounce">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak} Streak!</span>
            </div>
          )}

          {/* Stopwatch / Countdown */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <Clock className={cn("w-3.5 h-3.5", mode === 'MOCK_TEST' && timer < 300 ? "text-red-500 animate-spin" : "text-slate-400")} />
            <span className={cn(mode === 'MOCK_TEST' && timer < 300 ? "text-red-600 font-black" : "")}>
              {formatTime(timer)}
            </span>
          </div>

          {/* Question Index Pill */}
          <span className="text-xs font-black text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-xl">
            Q {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-9 relative overflow-hidden space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i <= difficultyLevel ? "bg-primary-600" : "bg-slate-200"
                  )} 
                />
              ))}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {difficultyLevel <= 2 ? 'Easy' : difficultyLevel <= 3 ? 'Medium' : 'Hard'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFlagCurrentQuestion}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer",
              isCurrentFlagged 
                ? "bg-purple-50 text-purple-700 border-purple-200" 
                : "text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isCurrentFlagged ? 'Flagged' : 'Flag Question'}</span>
          </button>
        </div>

        <p className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed select-text">
          {currentQuestion.content}
        </p>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {(currentQuestion.options || []).map((option, index) => {
            const isSelected = currentAnswer === index;
            const isCorrect = singleAnswerResult?.correctOptionIndex === index;
            const isWrong = isSelected && singleAnswerResult && !singleAnswerResult.isCorrect;

            let optionStyle = 'border-slate-200 bg-white hover:bg-slate-50/90 hover:border-primary-300 cursor-pointer text-slate-800';
            
            if (mode === 'PRACTICE' || mode === 'WEAK_DRILL') {
              if (singleAnswerResult) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold';
                } else if (isWrong) {
                  optionStyle = 'border-red-400 bg-red-50/80 text-red-900 font-bold';
                } else {
                  optionStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60 cursor-default';
                }
              }
            } else {
              if (isSelected) {
                optionStyle = 'border-primary-600 bg-primary-50/60 text-primary-900 font-bold ring-2 ring-primary-500/20';
              }
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectOption(index)}
                disabled={!!singleAnswerResult && mode !== 'MOCK_TEST'}
                className={cn(
                  'w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border-2 text-left transition-all duration-200 group',
                  optionStyle
                )}
              >
                <span className={cn(
                  'w-8 h-8 shrink-0 rounded-xl border-2 flex items-center justify-center text-xs font-black transition-all',
                  singleAnswerResult && isCorrect 
                    ? 'border-emerald-500 bg-emerald-500 text-white' 
                    : isWrong 
                    ? 'border-red-500 bg-red-500 text-white' 
                    : isSelected 
                    ? 'border-primary-600 bg-primary-600 text-white' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-primary-400'
                )}>
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="text-sm sm:text-base font-medium flex-1 select-text">
                  {option}
                </span>

                {singleAnswerResult && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {singleAnswerResult && isWrong && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant AI Solution Card (Practice Mode) */}
        {singleAnswerResult && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold",
                singleAnswerResult.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              )}>
                {singleAnswerResult.isCorrect ? '✅ Correct Answer!' : '❌ Incorrect Selection'}
              </span>
              <span className="text-xs font-bold text-slate-500">
                SRS Mastery: <strong className="text-primary-600">{singleAnswerResult.accuracy}%</strong>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed select-text">
              <strong className="text-slate-900 block mb-0.5">Explanation & Concept:</strong>
              {singleAnswerResult.explanation}
            </p>
          </div>
        )}

        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className="rounded-xl px-4 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            {mode === 'MOCK_TEST' && (
              <Button
                type="button"
                onClick={handleSubmitMockTest}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl px-6 font-bold text-xs"
              >
                Submit Mock Test
              </Button>
            )}

            <Button
              type="button"
              onClick={handleNextQuestion}
              className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl px-6 font-bold text-xs shadow-md shadow-primary-500/25 cursor-pointer"
            >
              <span>{currentIndex + 1 >= questions.length ? (mode === 'MOCK_TEST' ? 'Finish & Score' : 'Complete Drill') : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
}
