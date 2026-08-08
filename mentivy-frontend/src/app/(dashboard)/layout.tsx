'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load user sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mentivy_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('mentivy_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen overflow-hidden bg-slate-50 flex">
      {/* Collapsible Sidebar with Pinned Bottom Actions */}
      <Sidebar 
        isOpen={isMobileOpen} 
        setIsOpen={setIsMobileOpen} 
        isCollapsed={isCollapsed}
        setIsCollapsed={handleToggleCollapse}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-screen h-[100dvh] min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header 
          onMenuClick={() => setIsMobileOpen(true)} 
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Scrollable Main Content with Fluid Production-Grade Spacing */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between min-h-0">
          <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            {children}
          </div>

          {/* Footer with Copyright, Privacy Link, and Exam Platform Badge */}
          <footer className="mt-auto py-4 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-white shrink-0 text-center text-xs text-slate-400">
            <div className="w-full max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} Mentivy Inc. All rights reserved.</p>
              <div className="flex items-center gap-4 text-slate-400 font-medium">
                <Link href="/privacy" className="hover:text-primary-600 underline-offset-2 hover:underline transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <span>AI Spaced Repetition Engine</span>
                <span>•</span>
                <span>SSC CGL, UPSC & Banking</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
