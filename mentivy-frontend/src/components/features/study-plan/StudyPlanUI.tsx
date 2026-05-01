'use client';

import React from 'react';
import { Target, TrendingDown, RefreshCw, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PlanTopic {
  id: string;
  name: string;
  subjectName: string;
}

interface PlanCategory {
  type: 'NEW' | 'WEAK' | 'REVISION';
  allocatedMinutes: number;
  topics: PlanTopic[];
}

const categoryConfig = {
  NEW: {
    label: 'New Topics',
    description: 'Topics you have never studied before',
    icon: BookOpen,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    badge: 'bg-indigo-100 text-indigo-700',
    progressColor: 'bg-indigo-500',
  },
  WEAK: {
    label: 'Weak Topics',
    description: 'Topics where your accuracy is below 50%',
    icon: TrendingDown,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    progressColor: 'bg-orange-500',
  },
  REVISION: {
    label: 'Due for Revision',
    description: 'Scheduled spaced repetition reviews',
    icon: RefreshCw,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    progressColor: 'bg-emerald-500',
  },
};

export default function StudyPlanUI({ plan }: { plan: PlanCategory[] }) {
  const totalMinutes = plan.reduce((sum, c) => sum + c.allocatedMinutes, 0);
  const totalTopics = plan.reduce((sum, c) => sum + c.topics.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Today's Study Plan</h2>
          <p className="mt-2 text-slate-500">
            Personalized plan — <span className="font-semibold text-slate-700">{totalTopics} topics</span> across{' '}
            <span className="font-semibold text-slate-700">{totalMinutes} minutes</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <Target className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-slate-700">Daily Goal: {totalMinutes} mins</span>
        </div>
      </div>

      {/* Time Distribution Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Time Distribution</p>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          {plan.map((category) => {
            const config = categoryConfig[category.type];
            const width = totalMinutes > 0 ? (category.allocatedMinutes / totalMinutes) * 100 : 0;
            return (
              <div
                key={category.type}
                className={`${config.progressColor} transition-all duration-500`}
                style={{ width: `${width}%` }}
                title={`${category.type}: ${category.allocatedMinutes} mins`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {plan.map((category) => {
            const config = categoryConfig[category.type];
            return (
              <div key={category.type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${config.progressColor}`} />
                <span className="text-xs text-slate-600 font-medium">
                  {config.label} — {category.allocatedMinutes} mins
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Categories */}
      <div className="grid grid-cols-1 gap-6">
        {plan.map((category) => {
          const config = categoryConfig[category.type];
          const Icon = config.icon;

          return (
            <div key={category.type} className={`bg-white border ${config.border} rounded-2xl shadow-sm overflow-hidden`}>
              {/* Category Header */}
              <div className={`${config.bg} px-6 py-4 flex items-center justify-between border-b ${config.border}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${config.bg} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-slate-900`}>{config.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${config.badge}`}>
                  {category.allocatedMinutes} mins
                </span>
              </div>

              {/* Topics List */}
              <div className="divide-y divide-slate-100">
                {category.topics.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-400 text-sm">
                    🎉 No {config.label.toLowerCase()} right now — you're all caught up!
                  </div>
                ) : (
                  category.topics.map((topic, index) => (
                    <div key={topic.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{topic.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{topic.subjectName}</p>
                        </div>
                      </div>
                      <Link
                        href={`/practice?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${config.badge} opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        Practice
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
