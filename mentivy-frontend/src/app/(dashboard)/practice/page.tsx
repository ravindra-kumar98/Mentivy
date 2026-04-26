'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  CheckCircle2, XCircle, Clock, Loader2, ChevronRight,
  RotateCcw, Trophy, AlertCircle, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Question {
  id: string;
  topicId: string;
  content: string;
  options: string[];
  difficulty: number;
}

interface AnswerResult {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
}

type SessionState = 'loading' | 'question' | 'answered' | 'finished' | 'error';

const QUESTION_LIMIT = 10;

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicId = searchParams.get('topicId') || '';
  const topicName = searchParams.get('topicName') || 'Practice';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch questions for this topic
  const fetchQuestions = useCallback(async () => {
    if (!topicId) {
      setErrorMessage('No topic selected. Please go back and choose a topic.');
      setSessionState('error');
      return;
    }
    setSessionState('loading');
    try {
      const res = await apiClient.get('/questions', { params: { topicId, limit: QUESTION_LIMIT } });
      setQuestions(res.data.data);
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
      setSessionState('question');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to load questions.');
      setSessionState('error');
    }
  }, [topicId]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // Timer per question
  useEffect(() => {
    if (sessionState !== 'question') return;
    setTimer(0);
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [sessionState, currentIndex]);

  const handleSelectOption = async (optionIndex: number) => {
    if (sessionState !== 'question') return;
    setSelectedOption(optionIndex);

    const currentQuestion = questions[currentIndex];

    // 1. Check the answer via the secure backend endpoint
    try {
      const checkRes = await apiClient.post('/questions/check', {
        questionId: currentQuestion.id,
        selectedOptionIndex: optionIndex,
      });
      const result: AnswerResult = checkRes.data.data;
      setAnswerResult(result);

      // 2. Submit the attempt to update UserTopicStat (SRS engine)
      apiClient.post('/practice/submit', {
        topicId: currentQuestion.topicId,
        questionId: currentQuestion.id,
        isCorrect: result.isCorrect,
        timeTaken: timer,
      }).catch(() => {}); // Fire-and-forget, don't block UX

      // 3. Update session score
      if (result.isCorrect) {
        setScore(s => ({ ...s, correct: s.correct + 1 }));
      }
      setScore(s => ({ ...s, total: s.total + 1 }));
      setSessionState('answered');
    } catch (err) {
      // Fallback: just show selection without verification
      setSessionState('answered');
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setSessionState('finished');
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setAnswerResult(null);
      setSessionState('question');
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ---- Loading State ----
  if (sessionState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-slate-500 font-medium">Loading questions for {topicName}...</p>
      </div>
    );
  }

  // ---- Error State ----
  if (sessionState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <p className="font-semibold text-slate-800">{errorMessage}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  // ---- Finished State ----
  if (sessionState === 'finished') {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const isPassing = accuracy >= 60;
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center animate-in fade-in duration-500">
        <div className={cn("p-6 rounded-full", isPassing ? "bg-emerald-50" : "bg-orange-50")}>
          <Trophy className={cn("w-16 h-16", isPassing ? "text-emerald-500" : "text-orange-500")} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Session Complete!</h2>
          <p className="text-slate-500 mt-2">You practised <strong>{topicName}</strong></p>
        </div>
        <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-3xl font-bold text-slate-900">{accuracy}%</p>
            <p className="text-xs text-slate-500 mt-1">Accuracy</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-3xl font-bold text-emerald-600">{score.correct}</p>
            <p className="text-xs text-slate-500 mt-1">Correct</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-3xl font-bold text-slate-900">{score.total}</p>
            <p className="text-xs text-slate-500 mt-1">Attempted</p>
          </div>
        </div>
        <p className={cn("text-sm font-medium px-4 py-2 rounded-full", isPassing ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700")}>
          {isPassing ? '🎉 Great work! Your SRS schedule has been updated.' : '⚡ Keep practising — this topic is now marked for priority revision.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/study-plan')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Study Plan
          </Button>
          <Button onClick={fetchQuestions}>
            <RotateCcw className="w-4 h-4 mr-2" /> Retry Topic
          </Button>
        </div>
      </div>
    );
  }

  // ---- Question State ----
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {topicName}
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 text-slate-400" />
            {formatTime(timer)}
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 mb-6">
        {/* Difficulty Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={cn("w-2 h-2 rounded-full", i <= currentQuestion.difficulty ? "bg-primary-500" : "bg-slate-200")} />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">Difficulty</span>
        </div>

        <p className="text-lg font-semibold text-slate-900 leading-relaxed mb-8">
          {currentQuestion.content}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = answerResult?.correctOptionIndex === index;
            const isWrong = isSelected && answerResult && !answerResult.isCorrect;

            let optionStyle = 'border-slate-200 bg-white hover:bg-slate-50 hover:border-primary-300 cursor-pointer';
            if (sessionState === 'answered') {
              if (isCorrect) optionStyle = 'border-emerald-400 bg-emerald-50 cursor-default';
              else if (isWrong) optionStyle = 'border-red-400 bg-red-50 cursor-default';
              else optionStyle = 'border-slate-100 bg-slate-50 opacity-60 cursor-default';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={sessionState === 'answered'}
                className={cn('w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200', optionStyle)}
              >
                <span className={cn(
                  'w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all',
                  isCorrect && sessionState === 'answered' ? 'border-emerald-500 bg-emerald-500 text-white' :
                  isWrong ? 'border-red-500 bg-red-500 text-white' :
                  isSelected ? 'border-primary-500 bg-primary-500 text-white' :
                  'border-slate-300 text-slate-500'
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={cn('text-sm font-medium', isCorrect && sessionState === 'answered' ? 'text-emerald-800' : isWrong ? 'text-red-800' : 'text-slate-700')}>
                  {option}
                </span>
                {sessionState === 'answered' && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />}
                {sessionState === 'answered' && isWrong && <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation & Next */}
      {sessionState === 'answered' && (
        <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-4">
          {answerResult?.explanation && (
            <div className={cn("p-4 rounded-xl border text-sm leading-relaxed", answerResult.isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-orange-50 border-orange-200 text-orange-800")}>
              <strong>{answerResult.isCorrect ? '✅ Correct! ' : '❌ Incorrect. '}</strong>
              {answerResult.explanation}
            </div>
          )}
          <Button onClick={handleNext} className="w-full">
            {currentIndex + 1 >= questions.length ? 'Finish Session' : 'Next Question'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-slate-500 font-medium">Loading practice session...</p>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
