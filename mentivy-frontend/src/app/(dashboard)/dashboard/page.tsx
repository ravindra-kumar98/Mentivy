import React from 'react';
import Link from 'next/link';
import { 
  Target, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Clock, 
  Trophy, 
  Flame, 
  Sparkles,
  BarChart,
  Layers,
  ChevronRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { serverFetch } from '@/lib/server-fetch';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanTopic {
  id: string;
  name: string;
  subjectName: string;
  weightage?: number;
  accuracy?: number;
  stage?: number;
}

interface PlanSection {
  type: 'NEW' | 'WEAK' | 'REVISION';
  allocatedMinutes: number;
  topics: PlanTopic[];
}

interface WeakTopicItem {
  id: string;
  name: string;
  subjectName: string;
  accuracy: number;
}

interface SubjectProgress {
  subjectName: string;
  totalTopics: number;
  masteredTopics: number;
  progressPercent: number;
  avgAccuracy: number;
}

// ─── Badge config per plan type ──────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string; dot: string }> = {
  NEW:      { label: 'New Concept',  badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',   dot: 'bg-indigo-500' },
  WEAK:     { label: 'Weak Focus',   badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-500' },
  REVISION: { label: 'SRS Review',   badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

export default async function DashboardPage() {
  let stats = {
    targetExam: 'SSC CGL 2026',
    totalAttempted: 0,
    avgAccuracy: 74,
    weakTopics: [] as (string | WeakTopicItem)[],
    dailyGoalMins: 120,
    completedMins: 45,
    streakDays: 4,
    subjectProgress: [] as SubjectProgress[],
    activeDays: [true, true, true, true, false, false, false]
  };

  let planSections: PlanSection[] = [];

  try {
    const [statsRes, planRes] = await Promise.all([
      serverFetch('/guidance/stats'),
      serverFetch('/guidance/daily-plan'),
    ]);
    if (statsRes?.data) stats = { ...stats, ...statsRes.data };
    
    const rawPlan = planRes?.data;
    if (Array.isArray(rawPlan)) {
      planSections = rawPlan;
    } else if (rawPlan?.plan && Array.isArray(rawPlan.plan)) {
      planSections = rawPlan.plan;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }

  const completionPercent = Math.min(
    100,
    stats.dailyGoalMins > 0 ? Math.round((stats.completedMins / stats.dailyGoalMins) * 100) : 0
  );

  // Safely flatten all topics across sections
  const todaysTopics = (Array.isArray(planSections) ? planSections : [])
    .flatMap((s) => (s?.topics || []).map((t) => ({ ...t, type: s?.type })))
    .slice(0, 4);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

      {/* Top Greeting & Streak Hero Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {stats.targetExam} Aspirant
            </span>
            <span className="text-xs text-slate-400 font-medium">• Daily Memory Cycle Active</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, Ravindra!</h2>
          <p className="mt-1 text-sm text-slate-500">
            You are making steady progress today. Keep up your spaced repetition momentum!
          </p>
        </div>

        {/* 7-Day Attendance & Streak Fire Box */}
        <div className="flex items-center gap-4 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs shrink-0">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 leading-none block">{stats.streakDays || 4} Days</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Streak</span>
            </div>
          </div>

          {/* Weekday Dots */}
          <div className="flex items-center gap-1.5">
            {daysOfWeek.map((day, idx) => {
              const isActive = (stats.activeDays || [])[idx] ?? idx < 4;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400">{day}</span>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-primary-600 ring-2 ring-primary-200' 
                      : 'bg-slate-100'
                  }`}>
                    {isActive && <div className="w-1 h-1 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Daily Study Goal */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Study Goal</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {stats.completedMins} <span className="text-base font-semibold text-slate-400">/ {stats.dailyGoalMins} mins</span>
              </h3>
            </div>
            <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl border border-primary-100">
              <Target className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-1000"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-primary-600">{completionPercent}% completed</span>
              <span className="text-slate-400">{Math.max(0, stats.dailyGoalMins - stats.completedMins)} mins remaining</span>
            </div>
          </div>
        </div>

        {/* Card 2: Overall Accuracy */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Accuracy</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{stats.avgAccuracy}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              {stats.avgAccuracy >= 70 ? 'Excellent recall across active topics' : 'Keep practicing weak topics'}
            </p>
            <Link href="/analytics" className="text-xs font-bold text-primary-600 hover:text-primary-700">
              Analytics →
            </Link>
          </div>
        </div>

        {/* Card 3: Priority Weak Topics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weak Topics</p>
              <h3 className="text-3xl font-black text-orange-600 mt-1">
                {stats.weakTopics?.length || 0} <span className="text-sm font-semibold text-slate-400">to drill</span>
              </h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500">Scheduled for priority review</span>
            <Link href="/practice?mode=WEAK_DRILL" className="text-xs font-bold text-orange-600 hover:text-orange-700">
              Drill Now →
            </Link>
          </div>
        </div>

      </div>

      {/* Main Row: Quick Launcher Hero + Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Quick Action Hero Banner */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-7 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-primary-100 text-xs font-bold backdrop-blur-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Smart Revision Ready</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">Today&apos;s AI Study Plan</h3>
            <p className="text-xs sm:text-sm text-primary-100 leading-relaxed">
              We have synthesized a balanced session of new syllabus topics, weak area drills, and 5-stage Leitner spaced repetition reviews.
            </p>
          </div>

          <div className="pt-6 relative z-10 space-y-3">
            <Link href="/study-plan" className="block">
              <Button className="w-full bg-white text-primary-700 hover:bg-slate-50 active:bg-slate-100 font-bold border-none rounded-xl shadow-md py-3 group cursor-pointer">
                <span>View Full Study Plan</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/practice?mode=MOCK_TEST" className="block">
              <button 
                type="button" 
                className="w-full text-center py-2.5 text-xs font-bold text-primary-100 hover:text-white transition cursor-pointer"
              >
                Launch 25-Min Timed Mock Test →
              </button>
            </Link>
          </div>
        </div>

        {/* Right 2 Columns: Today's Scheduled Topics Widget */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Today&apos;s Focus Topics</h3>
              <p className="text-xs text-slate-500">Curated topics ready for practice</p>
            </div>
            <Link
              href="/study-plan"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all scheduled →
            </Link>
          </div>

          {todaysTopics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3 text-slate-400">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <BookOpen className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">You&apos;re all caught up for today! 🎉</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No pending revision topics in your queue. You can practice any subject anytime in the Practice Arena.
                </p>
              </div>
              <Link href="/practice">
                <Button variant="outline" className="rounded-xl mt-2 text-xs font-bold">
                  Open Practice Arena
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTopics.map((topic) => {
                const config = TYPE_CONFIG[topic.type] ?? TYPE_CONFIG.NEW;
                return (
                  <div
                    key={topic.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 hover:border-primary-200 hover:bg-slate-50 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{topic.name}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badgeClass}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{topic.subjectName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Link
                        href={`/practice?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-4 py-2 rounded-xl shadow-2xs shadow-primary-500/20 transition cursor-pointer"
                      >
                        <span>Start Drill</span>
                        <Play className="w-3 h-3 fill-white" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Subject Syllabus Mastery Progress Bars */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Syllabus Coverage &amp; Mastery</h3>
            <p className="text-xs text-slate-500">Progress across all core subjects of {stats.targetExam}</p>
          </div>
          <Link href="/analytics" className="text-xs font-bold text-primary-600 hover:text-primary-700">
            View Analytics →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(stats.subjectProgress && stats.subjectProgress.length > 0 ? stats.subjectProgress : [
            { subjectName: 'Quantitative Aptitude', totalTopics: 3, masteredTopics: 2, progressPercent: 67, avgAccuracy: 84 },
            { subjectName: 'Reasoning', totalTopics: 2, masteredTopics: 2, progressPercent: 100, avgAccuracy: 88 },
            { subjectName: 'English Language', totalTopics: 2, masteredTopics: 1, progressPercent: 50, avgAccuracy: 72 },
            { subjectName: 'General Awareness', totalTopics: 2, masteredTopics: 1, progressPercent: 50, avgAccuracy: 65 }
          ]).map((sub) => (
            <div key={sub.subjectName} className="p-4 bg-slate-50/60 border border-slate-200/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{sub.subjectName}</span>
                <span className="text-xs font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                  {sub.progressPercent}%
                </span>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-700"
                  style={{ width: `${sub.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{sub.masteredTopics}/{sub.totalTopics} Mastered</span>
                <span>{sub.avgAccuracy}% Avg Acc</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
