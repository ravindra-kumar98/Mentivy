'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Calendar,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  activityChart: Array<{ date: string; questions: number; accuracy: number }>;
  subjectChart: Array<{ name: string; value: number }>;
  masteryBreakdown: { WEAK: number; AVERAGE: number; STRONG: number };
  totalQuestions: number;
  totalStudyTimeMins: number;
}

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
const MASTERY_COLORS = {
  WEAK: '#ef4444',
  AVERAGE: '#f59e0b',
  STRONG: '#10b981'
};

export default function AnalyticsUI({ data }: { data: AnalyticsData }) {
  const masteryData = [
    { name: 'Weak', value: data.masteryBreakdown.WEAK },
    { name: 'Average', value: data.masteryBreakdown.AVERAGE },
    { name: 'Strong', value: data.masteryBreakdown.STRONG }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Learning Analytics</h2>
          <p className="mt-2 text-slate-500">Visualize your progress and identify areas for improvement.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button className="px-4 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg">7 Days</button>
            <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">30 Days</button>
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-slate-900">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={CheckCircle} 
          label="Total Questions" 
          value={data.totalQuestions.toString()} 
          trend="+12%" 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatCard 
          icon={Clock} 
          label="Study Time" 
          value={`${data.totalStudyTimeMins}m`} 
          trend="+5%" 
          color="text-sky-600" 
          bg="bg-sky-50" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg. Accuracy" 
          value={`${data.activityChart.length > 0 ? data.activityChart[data.activityChart.length - 1].accuracy : 0}%`} 
          trend="+2%" 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatCard 
          icon={Users} 
          label="Topics Covered" 
          value={(data.masteryBreakdown.WEAK + data.masteryBreakdown.AVERAGE + data.masteryBreakdown.STRONG).toString()} 
          trend="New" 
          color="text-orange-600" 
          bg="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity & Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Activity & Performance</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-primary-500 rounded-full" />
                <span className="text-slate-500">Questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-slate-500">Accuracy %</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activityChart}>
                <defs>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                  }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="questions" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorQuestions)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mastery Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-8">Mastery Breakdown</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">
                {Math.round((data.masteryBreakdown.STRONG / (data.masteryBreakdown.WEAK + data.masteryBreakdown.AVERAGE + data.masteryBreakdown.STRONG || 1)) * 100)}%
              </span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Strong</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={masteryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(MASTERY_COLORS)[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {masteryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: Object.values(MASTERY_COLORS)[i] }} />
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value} Topics</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subject Strength */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8">Subject Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.subjectChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} 
                  width={120}
                />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.subjectChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Learning Insights</h3>
          <div className="space-y-4">
            <InsightItem 
              type="positive"
              title="Accuracy is improving"
              description="Your accuracy in Quantitative Aptitude has increased by 15% this week. Keep it up!"
            />
            <InsightItem 
              type="warning"
              title="Revision needed"
              description="You haven't revised 'Indian Polity' in 5 days. Knowledge retention is dropping."
            />
            <InsightItem 
              type="info"
              title="New Strength detected"
              description="You've answered 10 consecutive Hard questions correctly in 'Modern History'."
            />
          </div>
          <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors border border-slate-100">
            View Learning Path
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 ${bg} ${color} rounded-xl`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}

function InsightItem({ type, title, description }: any) {
  const colors = {
    positive: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100',
    info: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[type as keyof typeof colors]}`}>
      <h5 className="font-bold text-sm">{title}</h5>
      <p className="text-xs mt-1 opacity-80 leading-relaxed">{description}</p>
    </div>
  );
}
