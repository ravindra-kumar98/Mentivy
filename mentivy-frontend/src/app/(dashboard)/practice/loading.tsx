import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PracticeLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-44 rounded-full" />
        <Skeleton className="h-10 w-72 sm:w-96 rounded-2xl" />
        <Skeleton className="h-4 w-60 sm:w-80 rounded-lg" />
      </div>

      {/* 2. Top 3 Practice Mode Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-3 w-full rounded-md" />
            </div>
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        ))}
      </div>

      {/* 3. Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-2xl shrink-0" />
        ))}
      </div>

      {/* 4. 9 Topic Practice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-5 w-40 rounded-lg" />
              </div>
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-10 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
