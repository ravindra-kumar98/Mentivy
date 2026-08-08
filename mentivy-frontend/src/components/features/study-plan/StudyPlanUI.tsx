'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Target, 
  TrendingDown, 
  RefreshCw, 
  BookOpen, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Zap, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PlanTopicItem {
  id: string;
  name: string;
  subjectName: string;
  weightage: number;
  accuracy?: number;
  stage?: number;
  status?: 'NEW' | 'WEAK' | 'AVERAGE' | 'STRONG';
  nextReviewDate?: string;
  dueInDays?: number;
}

export interface PlanCategoryItem {
  type: 'NEW' | 'WEAK' | 'REVISION';
  allocatedMinutes: number;
  topics: PlanTopicItem[];
}

export interface DayForecast {
  date: string;
  dayName: string;
  formattedDate: string;
  topicCount: number;
  topics: { id: string; name: string; subjectName: string; stage: number }[];
}

export interface StudyPlanData {
  targetExam?: string;
  dailyGoalMins?: number;
  subjects?: string[];
  plan: PlanCategoryItem[];
  forecast?: DayForecast[];
  summary?: {
    totalTopicsScheduled: number;
    totalMinutesAllocated: number;
    masteredCount: number;
    learningCount: number;
  };
}

// ─── Category Configuration ───────────────────────────────────────────────────

const categoryConfig = {
  NEW: {
    label: 'New Concepts',
    subTitle: 'First-time syllabus topics to build strong fundamentals',
    icon: BookOpen,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    badge: 'bg-indigo-100 text-indigo-700',
    progressColor: 'bg-indigo-600',
  },
  WEAK: {
    label: 'Weak Focus Areas',
    subTitle: 'Topics with accuracy below 50% needing targeted drills',
    icon: TrendingDown,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    progressColor: 'bg-orange-500',
  },
  REVISION: {
    label: 'Spaced Repetition Queue',
    subTitle: 'Scheduled reviews based on 5-stage Leitner memory retention',
    icon: RefreshCw,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    progressColor: 'bg-emerald-500',
  },
};

const STAGE_LABELS: Record<number, { name: string; class: string; icon: string }> = {
  0: { name: 'New', class: 'bg-slate-100 text-slate-600 border-slate-200', icon: '🌱' },
  1: { name: 'Stage 1 (1d)', class: 'bg-sky-50 text-sky-700 border-sky-200', icon: '🟢' },
  2: { name: 'Stage 2 (3d)', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔵' },
  3: { name: 'Stage 3 (7d)', class: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🟣' },
  4: { name: 'Stage 4 (14d)', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🟡' },
  5: { name: 'Stage 5 (Mastered)', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🏆' },
};

export default function StudyPlanUI({ planData }: { planData: any }) {
  // Graceful fallback for backwards compatibility
  const normalizedData: StudyPlanData = Array.isArray(planData) 
    ? { plan: planData, subjects: [], dailyGoalMins: 120, targetExam: 'SSC CGL' }
    : planData || { plan: [], subjects: [], dailyGoalMins: 120, targetExam: 'SSC CGL' };

  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  const {
    targetExam = 'SSC CGL 2026',
    dailyGoalMins = 120,
    subjects = ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
    plan = [],
    forecast = [],
    summary = {
      totalTopicsScheduled: plan.reduce((sum, p) => sum + (p.topics?.length || 0), 0),
      totalMinutesAllocated: dailyGoalMins,
      masteredCount: 0,
      learningCount: 0
    }
  } = normalizedData;

  const totalMinutes = plan.reduce((sum, c) => sum + (c.allocatedMinutes || 0), 0) || dailyGoalMins;

  // Filter topics by selected subject
  const filterTopics = (topics: PlanTopicItem[] = []) => {
    if (selectedSubject === 'ALL') return topics;
    return topics.filter(t => t.subjectName.toLowerCase() === selectedSubject.toLowerCase());
  };

  // Find first actionable topic for 1-click quick start
  const firstActionableTopic = plan.flatMap(p => p.topics)[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {targetExam}
            </span>
            <span className="text-xs text-slate-400 font-medium">• AI Spaced Repetition Active</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Today&apos;s AI Study Plan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Scientifically balanced memory intervals for maximum retention and score improvement.
          </p>
        </div>

        {firstActionableTopic && (
          <Link
            href={`/practice?topicId=${firstActionableTopic.id}&topicName=${encodeURIComponent(firstActionableTopic.name)}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm shadow-md shadow-primary-500/25 transition cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Start Today&apos;s Revision</span>
          </Link>
        )}
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl border border-primary-100">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Topics</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{summary.totalTopicsScheduled} Topics</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Study Time</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{dailyGoalMins} Minutes</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mastered (Stage 5)</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{summary.masteredCount} Topics</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active in Memory</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{summary.learningCount || summary.totalTopicsScheduled} Topics</h4>
          </div>
        </div>

      </div>

      {/* Dynamic Time Distribution Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Daily Time Allocation</h4>
            <p className="text-xs text-slate-500">Proportionally distributed from your {dailyGoalMins}-minute daily availability</p>
          </div>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            100% Balanced
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="flex h-3.5 rounded-full overflow-hidden gap-1 bg-slate-100 p-0.5">
          {plan.map((category) => {
            const config = categoryConfig[category.type];
            const width = totalMinutes > 0 ? (category.allocatedMinutes / totalMinutes) * 100 : 0;
            return (
              <div
                key={category.type}
                className={`${config.progressColor} rounded-full transition-all duration-700`}
                style={{ width: `${Math.max(10, width)}%` }}
                title={`${config.label}: ${category.allocatedMinutes} mins`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-1">
          {plan.map((category) => {
            const config = categoryConfig[category.type];
            return (
              <div key={category.type} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${config.progressColor}`} />
                <span className="text-xs font-semibold text-slate-700">
                  {config.label}: <strong className="text-slate-900">{category.allocatedMinutes}m</strong>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Subject:</span>
        </div>
        
        <button
          type="button"
          onClick={() => setSelectedSubject('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 ${
            selectedSubject === 'ALL'
              ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Subjects
        </button>

        {subjects.map((sub) => (
          <button
            key={sub}
            type="button"
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 ${
              selectedSubject === sub
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Plan Categories Grid */}
      <div className="grid grid-cols-1 gap-8">
        {plan.map((category) => {
          const config = categoryConfig[category.type];
          const Icon = config.icon;
          const filteredTopics = filterTopics(category.topics);

          return (
            <div 
              key={category.type} 
              className={`bg-white border ${config.border} rounded-3xl shadow-sm overflow-hidden transition hover:shadow-md`}
            >
              {/* Category Header */}
              <div className={`${config.bg} px-6 sm:px-8 py-5 flex items-center justify-between border-b ${config.border}`}>
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-100">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">{config.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{config.subTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${config.badge}`}>
                    {category.allocatedMinutes} Mins Allocated
                  </span>
                </div>
              </div>

              {/* Topics List */}
              <div className="divide-y divide-slate-100">
                {filteredTopics.length === 0 ? (
                  <div className="px-6 py-10 text-center space-y-1 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/70 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No {config.label.toLowerCase()} in this subject today!</p>
                    <p className="text-xs text-slate-400">You are on track with your spaced repetition schedule.</p>
                  </div>
                ) : (
                  filteredTopics.map((topic, index) => {
                    const stageInfo = STAGE_LABELS[topic.stage || 0] || STAGE_LABELS[0];

                    return (
                      <div 
                        key={topic.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4.5 hover:bg-slate-50/70 transition gap-3"
                      >
                        <div className="flex items-start gap-4">
                          <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm">{topic.name}</h4>
                              
                              {/* Subject Pill */}
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {topic.subjectName}
                              </span>

                              {/* SRS Stage Badge */}
                              {category.type === 'REVISION' && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${stageInfo.class}`}>
                                  <span>{stageInfo.icon}</span>
                                  <span>{stageInfo.name}</span>
                                </span>
                              )}

                              {/* Accuracy Pill for Weak topics */}
                              {category.type === 'WEAK' && topic.accuracy !== undefined && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                                  Accuracy: {topic.accuracy}%
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                              <span>Syllabus Weightage: {topic.weightage}/10</span>
                              {topic.dueInDays !== undefined && (
                                <span>• {topic.dueInDays === 0 ? 'Review Due Today' : `Due in ${topic.dueInDays} days`}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct Practice Launcher */}
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/practice?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-4 py-2 rounded-xl shadow-xs shadow-primary-500/20 transition cursor-pointer"
                          >
                            <span>Practice Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Visual Revision Forecast Calendar */}
      {forecast && forecast.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl border border-primary-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">7-Day Revision Forecast</h4>
                <p className="text-xs text-slate-500">Upcoming spaced repetition schedule automatically mapped to your memory curve</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecast.map((day, idx) => (
              <div
                key={day.date}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  idx === 0 
                    ? 'bg-primary-50/70 border-primary-300 ring-2 ring-primary-500/10' 
                    : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                  idx === 0 ? 'text-primary-700' : 'text-slate-500'
                }`}>
                  {day.dayName}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  {day.formattedDate}
                </span>
                
                <div className="mt-3">
                  <span className={`inline-flex items-center justify-center text-sm font-black w-8 h-8 rounded-full ${
                    day.topicCount > 0 
                      ? idx === 0 
                        ? 'bg-primary-600 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {day.topicCount}
                  </span>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">
                    {day.topicCount === 1 ? 'Topic' : 'Topics'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
