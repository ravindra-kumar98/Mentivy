import React from 'react';
import { Users, Database, Activity, Server } from 'lucide-react';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h2>
        <p className="mt-2 text-slate-500">High-level metrics and platform status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Students" value="2,451" trend="+12%" color="text-indigo-400" bg="bg-indigo-950" />
        <StatCard icon={Database} label="Question Bank" value="842" trend="+34" color="text-sky-400" bg="bg-sky-950" />
        <StatCard icon={Activity} label="Tests Taken" value="12,402" trend="+1.2k" color="text-emerald-400" bg="bg-emerald-950" />
        <StatCard icon={Server} label="System Status" value="Online" trend="99.9% Uptime" color="text-emerald-400" bg="bg-slate-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-slate-400 font-medium">Activity Chart Placeholder</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-slate-400 font-medium">Recent Signups Placeholder</p>
        </div>
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex items-end gap-2 mt-1">
          <h4 className="text-2xl font-bold text-slate-900 leading-none">{value}</h4>
          <span className="text-xs font-bold text-emerald-600 mb-0.5">{trend}</span>
        </div>
      </div>
    </div>
  );
}
