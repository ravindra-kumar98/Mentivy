'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Trophy,
  Zap,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { completeOnboarding } from '@/app/actions/user-actions';

export default function OnboardingUI() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    targetExam: '',
    targetYear: 2026,
    dailyTimeAvailability: 120,
    currentLevel: 'BEGINNER',
    preferredLanguage: 'English'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setIsSubmitting(true);
    const result = await completeOnboarding(data);
    if (result.success) {
      router.push('/dashboard');
    } else {
      alert(result.error || 'Failed to complete onboarding');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Progress Bar */}
      <div className="w-full mb-12 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary-600' : 'bg-slate-200'
              }`}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100 relative overflow-hidden">

        {/* Background Sparkle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">What's your target exam?</h2>
                <p className="mt-2 text-slate-500">We'll tailor your Guidance Engine to these specific topics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['SSC CGL', 'UPSC', 'Banking', 'Railway'].map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setData({ ...data, targetExam: exam })}
                    className={`p-6 rounded-3xl border-2 transition-all text-left group ${data.targetExam === exam
                      ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-50'
                      : 'border-slate-100 hover:border-slate-200'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-colors ${data.targetExam === exam ? 'bg-primary-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                      }`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <span className={`text-lg font-bold ${data.targetExam === exam ? 'text-primary-700' : 'text-slate-700'}`}>{exam}</span>
                    <p className="text-xs text-slate-400 mt-1">Full syllabus coverage enabled.</p>
                  </button>
                ))}
              </div>

              {/* Target Year Selector */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Exam Year</label>
                <div className="flex gap-3">
                  {[2026, 2027, 2028].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setData({ ...data, targetYear: year })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-colors ${data.targetYear === year
                        ? 'border-primary-600 bg-primary-60 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-sky-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">How much can you study?</h2>
                <p className="mt-2 text-slate-500">Your daily study plan will adapt to your schedule.</p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-10 space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Daily Goal</span>
                    <h3 className="text-5xl font-black text-slate-900 mt-1">
                      {data.dailyTimeAvailability}<span className="text-2xl text-slate-400 ml-2">min</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Optimal</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="30"
                  max="480"
                  step="15"
                  value={data.dailyTimeAvailability}
                  onChange={(e) => setData({ ...data, dailyTimeAvailability: parseInt(e.target.value) })}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />

                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>30 MIN</span>
                  <span>8 HOURS</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Where are you starting?</h2>
                <p className="mt-2 text-slate-500">Don't worry, the Guidance Engine will adjust as you go.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'BEGINNER', title: 'Beginner', desc: 'Starting from scratch, need core concepts.', icon: Sparkles },
                  { id: 'INTERMEDIATE', title: 'Intermediate', desc: 'Know the basics, want to master weak areas.', icon: BarChart },
                  { id: 'ADVANCED', title: 'Advanced', desc: 'Ready for hard questions and mock tests.', icon: Trophy },
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setData({ ...data, currentLevel: level.id })}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left ${data.currentLevel === level.id
                      ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-50'
                      : 'border-slate-100 hover:border-slate-200'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.currentLevel === level.id ? 'bg-primary-600 text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                      <level.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${data.currentLevel === level.id ? 'text-primary-700' : 'text-slate-700'}`}>
                        {level.title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-0.5">{level.desc}</p>
                    </div>
                    {data.currentLevel === level.id && <CheckCircle2 className="w-6 h-6 text-primary-600" />}
                  </button>
                ))}
              </div>

              {/* Language Preference */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Study Language</label>
                <div className="flex gap-3">
                  {['English', 'Hindi'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setData({ ...data, preferredLanguage: lang })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-colors ${data.preferredLanguage === lang
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : <div />}

            <Button
              onClick={step === 3 ? handleFinish : handleNext}
              disabled={step === 1 && !data.targetExam}
              isLoading={isSubmitting}
              className="flex-1 max-w-[200px] h-14 rounded-2xl gap-2 text-lg shadow-lg shadow-primary-200"
            >
              {step === 3 ? 'Get Started' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
}
