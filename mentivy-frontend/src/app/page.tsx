import Link from 'next/link';
import { ArrowRight, Brain, CalendarDays, BarChart3, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Guidance',
    description: 'Our engine analyzes your performance and builds a personalized daily plan so you always know what to study next.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: CalendarDays,
    title: 'Spaced Repetition',
    description: 'Topics are automatically re-scheduled using a proven memory algorithm, so you revise things right before you forget them.',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: BarChart3,
    title: 'Weakness Detection',
    description: 'Mentivy tracks your accuracy per topic and surfaces your weak areas, letting you fix them before exam day.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
];

function formatCount(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M+`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k+`;
  return `${num}+`;
}

async function getLandingStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/public/stats`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export default async function LandingPage() {
  const data = await getLandingStats();
  const statsData = data || {
    totalStudents: 0,
    totalQuestions: 0,
    totalTopics: 0,
    totalAttempts: 0,
    avgAccuracy: 0,
  };

  const stats = [
    { label: 'Students Enrolled', value: formatCount(statsData.totalStudents) },
    { label: 'Questions Practised', value: formatCount(statsData.totalAttempts) },
    { label: 'Exams Covered', value: `${statsData.totalTopics}+` },
    { label: 'Avg. Accuracy Rate', value: `${statsData.avgAccuracy}%` },
  ];
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">M</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Mentivy</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-100 rounded-full opacity-40 blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-100 rounded-full opacity-30 blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          Built for SSC, UPSC, Banking & more
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none max-w-4xl mb-6">
          Your Personalized <span className="text-indigo-600">Exam Coach</span>, Powered by AI
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Mentivy builds your daily study plan, tracks your weaknesses, and revises topics at precisely the right time — so you stop wasting time and start scoring higher.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 group"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-700 font-semibold px-8 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Everything you need to clear your exam
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
              Mentivy combines cognitive science with modern technology to make your preparation smarter, not harder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(feature => (
              <div key={feature.title} className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zNHY2aDZ2LTZoLTZ6TTYgNHY2aDZWNEg2em0wIDMwdjZoNnYtNkg2em0yNCAwaDB2NmhWMzRoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map(i => (
              <CheckCircle key={i} className="w-5 h-5 text-indigo-200 -mr-1" />
            ))}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to start your journey?</h2>
          <p className="text-indigo-200 mb-8 text-lg">Join thousands of students who trust Mentivy to guide their exam preparation.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-xl group"
          >
            Create Your Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© 2026 Mentivy. Built to help India crack its toughest exams.</p>
      </footer>

    </div>
  );
}
