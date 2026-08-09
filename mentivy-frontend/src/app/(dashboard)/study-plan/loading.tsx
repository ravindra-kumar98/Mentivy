import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudyPlanLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-10 w-72 sm:w-96 rounded-2xl" />
          <Skeleton className="h-4 w-60 sm:w-80 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-48 rounded-2xl shrink-0" />
      </div>

      {/* 2. Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Daily Time Allocation Bar Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded-lg" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex flex-wrap gap-6 pt-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
      </div>

      {/* 4. Scheduled Topics Queue & 7-Day Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scheduled Topics List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-52 rounded-xs" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Forecast (1 col) */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
