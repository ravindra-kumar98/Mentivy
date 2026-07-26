'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Users,
  Clock,
  CheckCircle,
  Minus,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  activityChart: Array<{ date: string; questions: number; accuracy: number }>;
  subjectChart: Array<{ name: string; value: number }>;
  masteryBreakdown: { WEAK: number; AVERAGE: number; STRONG: number };
  totalQuestions: number;
  totalStudyTimeMins: number;
}

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
const MASTERY_COLORS = {
  WEAK: '#ef4444',
  AVERAGE: '#f59e0b',
  STRONG: '#10b981',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Splits an array in half and compares the sum/average of each half.
 * Returns a formatted trend string like "+12%" or "-5%".
 */
function computeTrend(values: number[], mode: 'sum' | 'avg' = 'sum'): string {
  if (values.length < 2) return 'N/A';
  const mid = Math.floor(values.length / 2);
  const first = values.slice(0, mid);
  const second = values.slice(mid);

  const agg = (arr: number[]) =>
    mode === 'sum'
      ? arr.reduce((s, v) => s + v, 0)
      : arr.reduce((s, v) => s + v, 0) / arr.length;

  const prev = agg(first);
  const curr = agg(second);

  if (prev === 0) return curr > 0 ? 'New' : '—';
  const pct = Math.round(((curr - prev) / prev) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Generates real, data-driven insights from analytics response.
 */
function generateInsights(data: AnalyticsData) {
  const insights: Array<{ type: 'positive' | 'warning' | 'info'; title: string; description: string }> = [];

  const total = data.masteryBreakdown.WEAK + data.masteryBreakdown.AVERAGE + data.masteryBreakdown.STRONG;

  // Insight 1: Mastery / strength ratio
  if (total > 0) {
    const strongPct = Math.round((data.masteryBreakdown.STRONG / total) * 100);
    if (strongPct >= 50) {
      insights.push({
        type: 'positive',
        title: `Strong mastery on ${strongPct}% of topics`,
        description: `You have a strong grip on ${data.masteryBreakdown.STRONG} topic${data.masteryBreakdown.STRONG !== 1 ? 's' : ''}. Keep reinforcing them with spaced repetition to maintain retention.`,
      });
    } else if (strongPct > 0) {
      insights.push({
        type: 'info',
        title: `${strongPct}% topics at strong level`,
        description: `You've mastered ${data.masteryBreakdown.STRONG} topic${data.masteryBreakdown.STRONG !== 1 ? 's' : ''}. Focus on consistent practice to push more topics into the strong category.`,
      });
    }
  }

  // Insight 2: Weak topics warning
  if (data.masteryBreakdown.WEAK > 0) {
    insights.push({
      type: 'warning',
      title: `${data.masteryBreakdown.WEAK} topic${data.masteryBreakdown.WEAK !== 1 ? 's' : ''} need urgent attention`,
      description: `You have ${data.masteryBreakdown.WEAK} weak topic${data.masteryBreakdown.WEAK !== 1 ? 's' : ''} with low accuracy. Visit your Study Plan to start targeted revision sessions for these topics.`,
    });
  }

  // Insight 3: Accuracy trend
  const accuracyValues = data.activityChart.filter(d => d.questions > 0).map(d => d.accuracy);
  if (accuracyValues.length >= 4) {
    const mid = Math.floor(accuracyValues.length / 2);
    const prevAvg = accuracyValues.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
    const currAvg = accuracyValues.slice(mid).reduce((s, v) => s + v, 0) / (accuracyValues.length - mid);
    const diff = Math.round(currAvg - prevAvg);

    if (diff > 0) {
      insights.push({
        type: 'positive',
        title: `Accuracy improving by ${diff}%`,
        description: `Your recent accuracy is ${diff}% higher than earlier in this period. Your performance trend is moving in the right direction — keep the momentum going!`,
      });
    } else if (diff < -5) {
      insights.push({
        type: 'warning',
        title: `Accuracy dropped by ${Math.abs(diff)}%`,
        description: `Your accuracy has dipped recently. This could mean you're tackling harder topics or need more revision time. Check weak topics in your Study Plan.`,
      });
    }
  }

  // Insight 4: Activity consistency
  const activeDays = data.activityChart.filter(d => d.questions > 0).length;
  const totalDays = data.activityChart.length;
  if (totalDays > 0) {
    const consistencyPct = Math.round((activeDays / totalDays) * 100);
    if (consistencyPct >= 70) {
      insights.push({
        type: 'positive',
        title: `Great consistency — ${consistencyPct}% active days`,
        description: `You've been active on ${activeDays} out of ${totalDays} days. Consistent daily practice is the single biggest driver of exam success.`,
      });
    } else if (consistencyPct < 40 && totalDays >= 7) {
      insights.push({
        type: 'info',
        title: `Low activity — only ${consistencyPct}% active days`,
        description: `You've only practised on ${activeDays} out of ${totalDays} days. Even 20–30 minutes a day makes a big difference. Try setting a daily reminder.`,
      });
    }
  }

  // Insight 5: Top subject
  if (data.subjectChart.length > 0) {
    const top = [...data.subjectChart].sort((a, b) => b.value - a.value)[0];
    insights.push({
      type: 'info',
      title: `Most practiced: ${top.name}`,
      description: `You've answered the most questions in "${top.name}" (${top.value} attempts). Make sure to balance your practice across other subjects too.`,
    });
  }

  // Fallback if no data at all
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Start practising to unlock insights',
      description: 'Complete at least a few practice sessions to see personalised learning insights here.',
    });
  }

  return insights.slice(0, 3); // Show max 3
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsUI({ data, activeDays }: { data: AnalyticsData; activeDays: number }) {
  const masteryData = [
    { name: 'Weak',    value: data.masteryBreakdown.WEAK },
    { name: 'Average', value: data.masteryBreakdown.AVERAGE },
    { name: 'Strong',  value: data.masteryBreakdown.STRONG },
  ];

  const insights = generateInsights(data);

  // Real computed trends from activityChart
  const questionTrend  = computeTrend(data.activityChart.map(d => d.questions), 'sum');
  const accuracyTrend  = computeTrend(data.activityChart.filter(d => d.questions > 0).map(d => d.accuracy), 'avg');
  const totalTopics    = data.masteryBreakdown.WEAK + data.masteryBreakdown.AVERAGE + data.masteryBreakdown.STRONG;
  const studyTimeTrend = computeTrend(data.activityChart.map(d => d.questions), 'sum'); // proportional proxy

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Learning Analytics</h2>
          <p className="mt-2 text-slate-500">Visualize your progress and identify areas for improvement.</p>
        </div>

        {/* Real filter — Next.js Links that update the URL / trigger server re-fetch */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <Link
              href="/analytics?days=7"
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeDays === 7
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              7 Days
            </Link>
            <Link
              href="/analytics?days=30"
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeDays === 30
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              30 Days
            </Link>
          </div>
        </div>
      </div>

      {/* Top Level Stats — real computed trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CheckCircle}
          label="Total Questions"
          value={data.totalQuestions.toString()}
          trend={questionTrend}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={Clock}
          label="Study Time"
          value={`${data.totalStudyTimeMins}m`}
          trend={studyTimeTrend}
          color="text-sky-600"
          bg="bg-sky-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Accuracy"
          value={`${
            data.activityChart.filter(d => d.questions > 0).length > 0
              ? Math.round(
                  data.activityChart.filter(d => d.questions > 0).reduce((s, d) => s + d.accuracy, 0) /
                    data.activityChart.filter(d => d.questions > 0).length
                )
              : 0
          }%`}
          trend={accuracyTrend}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={Users}
          label="Topics Covered"
          value={totalTopics.toString()}
          trend={totalTopics > 0 ? `${data.masteryBreakdown.STRONG} strong` : 'None yet'}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Activity & Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Activity &amp; Performance</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-primary-500 rounded-full" />
                <span className="text-slate-500">Questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-slate-500">Accuracy %</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activityChart}>
                <defs>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                  tickFormatter={(str) =>
                    new Date(str).toLocaleDateString('en-US', { weekday: 'short' })
                  }
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
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
                  strokeWidth={3}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mastery Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-8">Mastery Breakdown</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">
                {Math.round(
                  (data.masteryBreakdown.STRONG / (totalTopics || 1)) * 100
                )}%
              </span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Strong</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={masteryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(MASTERY_COLORS)[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {masteryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: Object.values(MASTERY_COLORS)[i] }}
                  />
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value} Topics</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Subject Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8">Subject Distribution</h3>
          {data.subjectChart.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
              No subject data yet — start practising!
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjectChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                    width={120}
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.subjectChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Learning Insights — dynamically generated from real data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Learning Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <InsightItem key={i} type={insight.type} title={insight.title} description={insight.description} />
            ))}
          </div>
          <Link
            href="/study-plan"
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors border border-slate-100"
          >
            Go to Study Plan →
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
  const isNeutral  = !isPositive && !isNegative;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 ${bg} ${color} rounded-xl`}>
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            isPositive
              ? 'bg-emerald-50 text-emerald-600'
              : isNegative
              ? 'bg-red-50 text-red-500'
              : 'bg-slate-50 text-slate-600'
          }`}
        >
          {isPositive && <TrendingUp  className="w-3 h-3" />}
          {isNegative && <TrendingDown className="w-3 h-3" />}
          {isNeutral  && <Minus        className="w-3 h-3" />}
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}

function InsightItem({ type, title, description }: {
  type: 'positive' | 'warning' | 'info'; title: string; description: string;
}) {
  const config = {
    positive: {
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: <ThumbsUp    className="w-4 h-4 shrink-0 mt-0.5" />,
    },
    warning: {
      classes: 'bg-orange-50 text-orange-700 border-orange-100',
      icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
    },
    info: {
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      icon: <Lightbulb  className="w-4 h-4 shrink-0 mt-0.5" />,
    },
  };

  const { classes, icon } = config[type];

  return (
    <div className={`p-4 rounded-xl border ${classes} flex items-start gap-3`}>
      {icon}
      <div>
        <h5 className="font-bold text-sm">{title}</h5>
        <p className="text-xs mt-1 opacity-80 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
