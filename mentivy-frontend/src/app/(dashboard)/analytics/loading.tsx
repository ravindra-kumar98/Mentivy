import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-44 rounded-full" />
        <Skeleton className="h-10 w-72 sm:w-96 rounded-2xl" />
        <Skeleton className="h-4 w-60 sm:w-80 rounded-lg" />
      </div>

      {/* 2. Projected Exam Score Hero Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-3 w-full lg:w-2/3">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-lg rounded-md" />
        </div>
        <div className="flex items-center gap-6 w-full lg:w-auto shrink-0">
          <div className="space-y-1 text-center">
            <Skeleton className="h-8 w-24 rounded-lg mx-auto" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
          <div className="h-12 w-px bg-slate-100" />
          <div className="space-y-1 text-center">
            <Skeleton className="h-8 w-24 rounded-lg mx-auto" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* 3. 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Chart Placeholder & Strong/Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-3 w-60 rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-xl" />
              <Skeleton className="h-8 w-16 rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>

        {/* Strong vs Weak Topics (1 col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded-lg" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded-lg" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
