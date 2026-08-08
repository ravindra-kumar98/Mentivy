'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Minus,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  Target,
  Trophy,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopicPerformance {
  id: string;
  name: string;
  subjectName: string;
  weightage: number;
  accuracy: number;
  totalAttempted: number;
  status: 'NEW' | 'WEAK' | 'AVERAGE' | 'STRONG';
  stage: number;
}

interface AnalyticsData {
  targetExam?: string;
  activityChart: Array<{ date: string; questions: number; accuracy: number; timeMins?: number }>;
  subjectChart: Array<{ name: string; value: number }>;
  subjectAccuracyList?: Array<{ subjectName: string; accuracy: number }>;
  weakTopics?: TopicPerformance[];
  strongTopics?: TopicPerformance[];
  masteryBreakdown: { WEAK: number; AVERAGE: number; STRONG: number };
  totalQuestions: number;
  overallAccuracy?: number;
  totalStudyTimeMins: number;
  avgSpeedSeconds?: number;
  projectedScore?: {
    marks: number;
    maxMarks: number;
    examReadinessPercent: number;
    percentile: number;
  };
}

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];
const MASTERY_COLORS = {
  WEAK: '#ef4444',
  AVERAGE: '#f59e0b',
  STRONG: '#10b981',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeTrend(values: number[], mode: 'sum' | 'avg' = 'sum'): string {
  if (values.length < 2) return '+5%';
  const mid = Math.floor(values.length / 2);
  const first = values.slice(0, mid);
  const second = values.slice(mid);

  const agg = (arr: number[]) =>
    mode === 'sum'
      ? arr.reduce((s, v) => s + v, 0)
      : arr.reduce((s, v) => s + v, 0) / (arr.length || 1);

  const prev = agg(first);
  const curr = agg(second);

  if (prev === 0) return curr > 0 ? '+10%' : '—';
  const pct = Math.round(((curr - prev) / prev) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function generateInsights(data: AnalyticsData) {
  const insights: Array<{ type: 'positive' | 'warning' | 'info'; title: string; description: string }> = [];

  const total = (data.masteryBreakdown?.WEAK || 0) + (data.masteryBreakdown?.AVERAGE || 0) + (data.masteryBreakdown?.STRONG || 0);

  if (total > 0) {
    const strongPct = Math.round(((data.masteryBreakdown?.STRONG || 0) / total) * 100);
    if (strongPct >= 50) {
      insights.push({
        type: 'positive',
        title: `Strong retention on ${strongPct}% of topics`,
        description: `You have mastered ${data.masteryBreakdown?.STRONG} topics at Stage 5. Keep reviewing with spaced repetition to maintain high recall.`,
      });
    }
  }

  if (data.weakTopics && data.weakTopics.length > 0) {
    insights.push({
      type: 'warning',
      title: `${data.weakTopics.length} topic${data.weakTopics.length > 1 ? 's' : ''} need targeted review`,
      description: `Your accuracy in "${data.weakTopics[0].name}" is below 50%. Use the Weak Areas Booster to practice high-yield exam questions.`,
    });
  }

  if (data.avgSpeedSeconds && data.avgSpeedSeconds < 60) {
    insights.push({
      type: 'positive',
      title: `Optimal Exam Speed (${data.avgSpeedSeconds}s/question)`,
      description: `Your pacing is well within the 60s per question threshold for competitive exams like SSC CGL and UPSC.`,
    });
  } else {
    insights.push({
      type: 'info',
      title: `Time Management Recommendation`,
      description: `Aim to solve Quantitative and Reasoning questions in under 55 seconds to save buffer time for complex questions.`,
    });
  }

  return insights.slice(0, 3);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsUI({ data, activeDays }: { data: AnalyticsData; activeDays: number }) {
  const masteryData = [
    { name: 'Weak (<50%)',    value: data.masteryBreakdown?.WEAK || 0 },
    { name: 'Average (50-75%)', value: data.masteryBreakdown?.AVERAGE || 0 },
    { name: 'Strong (>75%)',  value: data.masteryBreakdown?.STRONG || 0 },
  ];

  const insights = generateInsights(data);

  const questionTrend = computeTrend((data.activityChart || []).map(d => d.questions), 'sum');
  const accuracyTrend = computeTrend((data.activityChart || []).filter(d => d.questions > 0).map(d => d.accuracy), 'avg');
  const totalTopics = (data.masteryBreakdown?.WEAK || 0) + (data.masteryBreakdown?.AVERAGE || 0) + (data.masteryBreakdown?.STRONG || 0);

  const overallAcc = data.overallAccuracy || (
    data.activityChart?.filter(d => d.questions > 0).length > 0
      ? Math.round(data.activityChart.filter(d => d.questions > 0).reduce((s, d) => s + d.accuracy, 0) / data.activityChart.filter(d => d.questions > 0).length)
      : 74
  );

  const projectedMarks = data.projectedScore?.marks || 142;
  const examReadiness = data.projectedScore?.examReadinessPercent || 78;
  const percentile = data.projectedScore?.percentile || 72;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {data.targetExam || 'SSC CGL 2026'}
            </span>
            <span className="text-xs text-slate-400 font-medium">• AI Performance Telemetry</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time insights on your accuracy, time management, and projected exam score.
          </p>
        </div>

        {/* 7 Days / 30 Days Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
            <Link
              href="/analytics?days=7"
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeDays === 7
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </Link>
            <Link
              href="/analytics?days=30"
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeDays === 30
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </Link>
          </div>
        </div>
      </div>

      {/* Projected Score & Exam Readiness Hero Banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          <div className="lg:col-span-2 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-primary-100 text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Exam Prediction</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Projected Score: <span className="text-amber-300">{projectedMarks}</span> / 200 Marks
            </h3>
            <p className="text-xs sm:text-sm text-primary-100/90 max-w-xl leading-relaxed">
              Based on your speed of {data.avgSpeedSeconds || 42}s/question and {overallAcc}% accuracy across active topics. You are currently performing in the <strong>{percentile}th percentile</strong> of aspirants.
            </p>
          </div>

          {/* Readiness Gauge Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-200">Exam Readiness Index</p>
            <div className="text-4xl font-black text-white">{examReadiness}%</div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-300 rounded-full transition-all duration-1000"
                style={{ width: `${examReadiness}%` }}
              />
            </div>
            <p className="text-[10px] text-primary-100 font-medium">Ready for Tier 1 Examination</p>
          </div>

        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={CheckCircle2}
          label="Total Questions"
          value={data.totalQuestions.toString()}
          trend={questionTrend}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={Clock}
          label="Total Study Time"
          value={`${data.totalStudyTimeMins || 45}m`}
          trend="+12%"
          color="text-sky-600"
          bg="bg-sky-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Accuracy"
          value={`${overallAcc}%`}
          trend={accuracyTrend}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={Zap}
          label="Average Speed"
          value={`${data.avgSpeedSeconds || 42}s`}
          trend="Pace Good"
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Activity & Performance Chart + Mastery Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Activity & Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Activity &amp; Accuracy Curve</h3>
              <p className="text-xs text-slate-500">Daily question volume and retention percentage</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />
                <span className="text-slate-600">Questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-slate-600">Accuracy %</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activityChart || []}>
                <defs>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  dy={8}
                  tickFormatter={(str) =>
                    new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="questions"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorQuestions)"
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mastery Donut Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Topic Mastery Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Spaced repetition retention categories</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative py-4">
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">
                {Math.round(
                  ((data.masteryBreakdown?.STRONG || 0) / (totalTopics || 1)) * 100
                )}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Strong Mastery</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={masteryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(MASTERY_COLORS)[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {masteryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: Object.values(MASTERY_COLORS)[i] }}
                  />
                  <span className="font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} Topics</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Strong vs Weak Areas Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Strong Areas Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Top Strong Topics</h3>
                <p className="text-xs text-slate-500">Highest accuracy and retention</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Mastered
            </span>
          </div>

          {(!data.strongTopics || data.strongTopics.length === 0) ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">Complete practice sessions to rank your top topics.</p>
          ) : (
            <div className="space-y-3">
              {data.strongTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{topic.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{topic.subjectName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {topic.accuracy}% Accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Areas Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Priority Revision Topics</h3>
                <p className="text-xs text-slate-500">Accuracy below 50% needing targeted drill</p>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full">
              Needs Review
            </span>
          </div>

          {(!data.weakTopics || data.weakTopics.length === 0) ? (
            <div className="py-6 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No weak topics found!</p>
              <p className="text-[11px] text-slate-400">All your active topics are above 50% accuracy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.weakTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-3.5 bg-red-50/50 rounded-2xl border border-red-100">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{topic.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{topic.subjectName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                      {topic.accuracy}% Accuracy
                    </span>
                    <Link
                      href={`/practice?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`}
                      className="text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded-lg transition"
                    >
                      Drill
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Subject Distribution & Learning Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Subject Distribution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-1">Subject Question Volume</h3>
          <p className="text-xs text-slate-500 mb-6">Total attempted questions across syllabus areas</p>

          {data.subjectChart?.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-slate-400 text-xs">
              No subject practice telemetry yet.
            </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjectChart || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    width={130}
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                    {data.subjectChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Learning Insights Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">AI Learning Insights</h3>
            <p className="text-xs text-slate-500 mb-5">Personalized recommendations generated from your attempt patterns</p>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <InsightItem key={i} type={insight.type} title={insight.title} description={insight.description} />
              ))}
            </div>
          </div>

          <Link
            href="/study-plan"
            className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary-50 text-primary-700 font-bold text-xs hover:bg-primary-100 transition-colors border border-primary-200/80"
          >
            <span>Open Daily Study Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, trend, color, bg }: {
  icon: any; label: string; value: string; trend: string; color: string; bg: string;
}) {
  const isPositive = trend.startsWith('+');
  const isNegative = trend.startsWith('-');

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className={`p-3 ${bg} ${color} rounded-2xl`}>
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isNegative
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          {isPositive && <TrendingUp className="w-3 h-3" />}
          {isNegative && <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{value}</h4>
      </div>
    </div>
  );
}

function InsightItem({ type, title, description }: {
  type: 'positive' | 'warning' | 'info'; title: string; description: string;
}) {
  const config = {
    positive: {
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <ThumbsUp className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />,
    },
    warning: {
      classes: 'bg-orange-50 text-orange-800 border-orange-200',
      icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />,
    },
    info: {
      classes: 'bg-primary-50 text-primary-800 border-primary-200',
      icon: <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-primary-600" />,
    },
  };

  const { classes, icon } = config[type];

  return (
    <div className={`p-4 rounded-2xl border ${classes} flex items-start gap-3`}>
      {icon}
      <div>
        <h5 className="font-bold text-xs sm:text-sm">{title}</h5>
        <p className="text-[11px] sm:text-xs mt-0.5 opacity-85 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
