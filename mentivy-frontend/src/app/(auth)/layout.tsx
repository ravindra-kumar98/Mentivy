import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100 blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100 blur-3xl opacity-50" />
      
      {/* Central Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8 rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 tracking-tight">Mentivy</h1>
          <p className="text-slate-500 text-sm mt-2">Your personalized guidance system</p>
        </div>
        {children}
      </div>
    </div>
  );
}
