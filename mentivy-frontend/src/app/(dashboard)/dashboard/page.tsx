import React from 'react';
import Link from 'next/link';
import { Target, TrendingDown, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { serverFetch } from '@/lib/server-fetch';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanTopic {
  id: string;
  name: string;
  subjectName: string;
}

interface PlanSection {
  type: 'NEW' | 'WEAK' | 'REVISION';
  allocatedMinutes: number;
  topics: PlanTopic[];
}

// ─── Badge config per plan type ──────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string; dot: string }> = {
  NEW:      { label: 'New',      badgeClass: 'bg-indigo-100 text-indigo-700',   dot: 'bg-indigo-500' },
  WEAK:     { label: 'Weak',     badgeClass: 'bg-orange-100 text-orange-700',   dot: 'bg-orange-500' },
  REVISION: { label: 'Revision', badgeClass: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  let stats = {
    totalAttempted: 0,
    avgAccuracy: 0,
    weakTopics: [] as string[],
    dailyGoalMins: 120,
    completedMins: 0,
  };

  let planSections: PlanSection[] = [];

  try {
    const [statsRes, planRes] = await Promise.all([
      serverFetch('/guidance/stats'),
      serverFetch('/guidance/daily-plan'),
    ]);
    stats = statsRes.data;
    planSections = planRes.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }

  const completionPercent = Math.min(
    100,
    stats.dailyGoalMins > 0 ? (stats.completedMins / stats.dailyGoalMins) * 100 : 0
  );

  // Flatten all topics across sections, max 4 shown in the widget
  const todaysTopics = planSections
    .flatMap((s) => s.topics.map((t) => ({ ...t, type: s.type })))
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your Guidance Overview</h2>
        <p className="mt-2 text-slate-600">Here is your daily snapshot and personalized recommendations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1: Daily Study Goal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500">Daily Study Goal</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.completedMins} / {stats.dailyGoalMins}{' '}
                <span className="text-sm font-normal text-slate-500">mins</span>
              </h3>
            </div>
            <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-xs font-medium text-primary-600 mt-2">
              {Math.max(0, stats.dailyGoalMins - stats.completedMins)} mins remaining today
            </p>
          </div>
        </div>

        {/* Card 2: Weak Topics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500">Weak Topics</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.weakTopics.length}{' '}
                <span className="text-sm font-normal text-slate-500">to revise</span>
              </h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {stats.weakTopics.length > 0 ? (
              stats.weakTopics.map((topic) => (
                <span
                  key={topic}
                  className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate"
                >
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400 italic px-3 py-1.5">
                No weak topics found yet.
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Overall Accuracy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500">Overall Accuracy</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.avgAccuracy}%</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-slate-600 mb-4">
              {stats.avgAccuracy > 70
                ? 'Great progress! You are doing well.'
                : 'Keep practicing to improve your score.'}
            </p>
            <Link href="/analytics">
              <Button variant="outline" className="w-full text-xs h-9">
                View detailed report
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CTA Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Start Daily Study Plan</h3>
            <p className="text-primary-100 mb-6 max-w-sm">
              We have prepared a mixed session of new topics and spaced-repetition practice for you.
            </p>
            <Link href="/study-plan">
              <Button className="bg-white text-primary-700 hover:bg-slate-50 border-none group">
                View Full Plan
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Today's Plan Widget — real data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">Today&apos;s Plan</h3>
            <Link
              href="/study-plan"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View full plan →
            </Link>
          </div>

          {todaysTopics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-full">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">You&apos;re all caught up! 🎉</p>
                <p className="text-xs text-slate-400 mt-1">
                  No topics scheduled for today. Keep up the great work.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTopics.map((topic) => {
                const config = TYPE_CONFIG[topic.type] ?? TYPE_CONFIG.NEW;
                return (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{topic.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{topic.subjectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                      <Link
                        href={`/practice?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`}
                        className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded-lg transition-colors"
                      >
                        Start
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
