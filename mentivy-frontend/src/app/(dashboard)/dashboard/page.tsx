import React from 'react';
import { Target, TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your Guidance Overview</h2>
        <p className="mt-2 text-slate-600">Here is your daily snapshot and personalized recommendations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Daily Study Goal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500">Daily Study Goal</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">45 / 120 <span className="text-sm font-normal text-slate-500">mins</span></h3>
            </div>
            <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full w-[37.5%]"></div>
            </div>
            <p className="text-xs font-medium text-primary-600 mt-2">75 mins remaining today</p>
          </div>
        </div>

        {/* Card 2: Weak Topics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500">Weak Topics</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">3 <span className="text-sm font-normal text-slate-500">to revise</span></h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <span className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">Quantitative Aptitude</span>
            <span className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">Indian Polity</span>
          </div>
        </div>

        {/* Card 3: Recent Accuracy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500">Recent Accuracy</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">78%</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-slate-600 mb-4">+5% from last week. Great progress!</p>
            <Button variant="outline" className="w-full text-xs h-9">View detailed report</Button>
          </div>
        </div>

      </div>

      {/* Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Start Daily Study Plan</h3>
            <p className="text-primary-100 mb-6 max-w-sm">We have prepared a mixed session of new topics and spaced-repetition practice for you.</p>
            <Button className="bg-white text-primary-700 hover:bg-slate-50 border-none group">
              Start Session 
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Revisions</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Number System</p>
                  <p className="text-xs text-slate-500 mt-0.5">Due today • 15 mins</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">Revise</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Medieval History</p>
                  <p className="text-xs text-slate-500 mt-0.5">Due tomorrow • 20 mins</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs">Postpone</Button>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}
