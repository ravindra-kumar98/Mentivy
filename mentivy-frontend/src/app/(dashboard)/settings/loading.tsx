import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-60 rounded-2xl" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* 2. Grid Layout (Tabs + Form Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs (1 col) */}
        <div className="lg:col-span-1 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl" />
          ))}
        </div>

        {/* Form Content Area (3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
            
            {/* Avatar Header */}
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
              <Skeleton className="w-20 h-20 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-44 rounded-lg" />
                <Skeleton className="h-4 w-56 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>

            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>

            {/* Save Button Footer */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
