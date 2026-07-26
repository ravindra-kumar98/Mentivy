import React from 'react';
import { AlertCircle, Users, Database, Activity, Layers, TrendingUp } from 'lucide-react';
import { serverFetch } from '@/lib/server-fetch';

interface AdminStats {
  totalStudents: number;
  totalQuestions: number;
  totalTopics: number;
  totalAttempts: number;
}

export default async function AdminOverviewPage() {
  let stats: AdminStats = {
    totalStudents: 0,
    totalQuestions: 0,
    totalTopics: 0,
    totalAttempts: 0,
  };

  let fetchError = false;

  try {
    const res = await serverFetch('/admin/stats');
    stats = res.data;
  } catch (err) {
    console.error('Failed to fetch admin stats:', err);
    fetchError = true;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h2>
        <p className="mt-2 text-slate-500">Real-time platform metrics from the database.</p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Could not load stats from the server. Make sure the backend is running.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          description="Registered student accounts"
          color="text-indigo-600"
          bg="bg-indigo-50"
          border="border-indigo-100"
        />
        <StatCard
          icon={Database}
          label="Question Bank"
          value={stats.totalQuestions.toLocaleString()}
          description="Questions across all topics"
          color="text-sky-600"
          bg="bg-sky-50"
          border="border-sky-100"
        />
        <StatCard
          icon={Activity}
          label="Attempts Logged"
          value={stats.totalAttempts.toLocaleString()}
          description="Total practice attempts made"
          color="text-emerald-600"
          bg="bg-emerald-50"
          border="border-emerald-100"
        />
        <StatCard
          icon={Layers}
          label="Topics"
          value={stats.totalTopics.toLocaleString()}
          description="Topics in the content library"
          color="text-orange-600"
          bg="bg-orange-50"
          border="border-orange-100"
        />
      </div>

      {/* Quick Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RatioCard
          label="Avg. Questions per Topic"
          value={
            stats.totalTopics > 0
              ? (stats.totalQuestions / stats.totalTopics).toFixed(1)
              : '—'
          }
          icon={TrendingUp}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <RatioCard
          label="Avg. Attempts per Student"
          value={
            stats.totalStudents > 0
              ? (stats.totalAttempts / stats.totalStudents).toFixed(1)
              : '—'
          }
          icon={Activity}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <RatioCard
          label="Avg. Questions per Student"
          value={
            stats.totalStudents > 0
              ? (stats.totalQuestions / stats.totalStudents).toFixed(1)
              : '—'
          }
          icon={Database}
          color="text-sky-600"
          bg="bg-sky-50"
        />
      </div>

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, description, color, bg, border,
}: {
  icon: any; label: string; value: string; description: string;
  color: string; bg: string; border: string;
}) {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${border} shadow-sm`}>
      <div className={`inline-flex p-3 ${bg} ${color} rounded-xl mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-3xl font-bold text-slate-900 leading-none">{value}</h4>
      <p className="text-sm font-semibold text-slate-700 mt-2">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function RatioCard({
  icon: Icon, label, value, color, bg,
}: {
  icon: any; label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
