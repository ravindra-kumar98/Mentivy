'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  ArrowLeft, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function PrivacyPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(user ? '/dashboard' : '/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-primary-600 group-hover:bg-primary-700 rounded-xl flex items-center justify-center shadow-xs transition-colors">
            <span className="text-white font-black text-lg leading-none">M</span>
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">Mentivy</span>
        </Link>

        {/* Dynamic Back Navigation based on Auth Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBack}
                className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>

              <Link href="/login">
                <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white cursor-pointer shadow-xs">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Privacy Document */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 flex-1">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Privacy &amp; Data Protection Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Your Privacy &amp; Data Security
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Last Updated: August 2026 • Effective for all Mentivy aspirants preparing for SSC CGL, UPSC, and Banking examinations.
          </p>
        </div>

        {/* 4 Core Guarantees Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Encrypted Storage</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Passwords are salted and encrypted with industry-standard bcrypt hashing. Sessions are guarded with secure, httpOnly JWT cookies.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Zero Data Selling</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We never sell or monetize your quiz scores, performance analytics, or personal identity with third-party advertisers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Spaced Repetition Telemetry</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your test accuracy and time-per-question metrics are strictly processed by our Leitner 5-stage algorithm to optimize revision schedules.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Full Data Ownership</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You maintain total control over your account. You can export your entire study history or permanently delete your account at any time.
            </p>
          </div>

        </div>

        {/* Detailed Sections */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 divide-y divide-slate-100">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To deliver personalized learning guidance and Spaced Repetition algorithms, Mentivy collects the following minimal information:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Account Details:</strong> Your full name, email address, optional contact number, and target exam (e.g. SSC CGL 2026).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Learning Telemetry:</strong> Question selections, correctness, time spent per problem, and Leitner intervals.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Authentication Data:</strong> Secure password hashes or Google OAuth tokens for single sign-on.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="pt-8 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. How Your Data Is Used</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your study data is used exclusively to provide and improve your learning experience:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <span>Generating your <strong>Daily Study Plan</strong> with balanced time allocations (45% New Concepts, 30% Weak Focus, 25% Spaced Reviews).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <span>Predicting your <strong>Exam Readiness Index</strong> and projected scores out of 200 marks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <span>Delivering real-time revision notifications when topics are due for review.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="pt-8 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Cookies &amp; Session Security</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mentivy uses essential, secure cookies strictly for session authentication. We do not use third-party tracking or cross-site advertising cookies. All session cookies are configured with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-800 font-mono">httpOnly</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-800 font-mono">SameSite=Lax</code> protections.
            </p>
          </section>

          {/* Section 4 */}
          <section className="pt-8 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Data Retention &amp; Account Deletion</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You can export your complete study history from your <strong>Settings &gt; Privacy &amp; Data</strong> tab or request permanent account deletion. Upon deletion, all associated SRS cards, quiz logs, and profile records are erased from our database within 24 hours.
            </p>
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Mentivy Inc. All rights reserved. • AI Spaced Repetition Learning Platform</p>
      </footer>

    </div>
  );
}
