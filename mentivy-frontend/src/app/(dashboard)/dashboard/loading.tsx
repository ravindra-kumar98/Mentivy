import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Hero + Streak Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-44 rounded-full" />
          </div>
          <Skeleton className="h-10 w-72 sm:w-96 rounded-2xl" />
          <Skeleton className="h-4 w-60 sm:w-80 rounded-lg" />
        </div>

        {/* Streak Fire Bar Skeleton */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-2.5 w-3 rounded-xs" />
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top 3 KPI Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-9 w-36 rounded-xl" />
              </div>
              <Skeleton className="w-12 h-12 rounded-2xl" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Smart Revision Hero Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 w-full md:w-2/3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-7 w-64 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-lg rounded-lg" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Skeleton className="h-12 w-36 rounded-2xl" />
          <Skeleton className="h-12 w-44 rounded-2xl" />
        </div>
      </div>

      {/* 4. Today's Focus Topics & Syllabus Mastery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Focus Topics (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-3 w-56 rounded-md" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>

          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-48 rounded-xs" />
                  </div>
                </div>
                <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus Coverage (1 col) */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
