'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpenCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Study Plan', href: '/study-plan', icon: CalendarDays },
  { name: 'Practice', href: '/practice', icon: BookOpenCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: () => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container - 100vh on all devices with permanently pinned bottom actions */}
      <aside className={cn(
        "h-screen h-[100dvh] max-h-screen bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out select-none relative z-40",
        // Mobile Drawer
        isOpen ? "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl overflow-y-auto" : "hidden lg:flex",
        // Desktop Layout: allow tooltips to overflow cleanly when collapsed
        isCollapsed ? "lg:w-20 overflow-visible" : "lg:w-64 overflow-hidden"
      )}>
        
        {/* Top: Logo Only (Clean & Elegant) */}
        <div className={cn(
          "h-16 shrink-0 flex items-center border-b border-slate-100 transition-all",
          isCollapsed ? "justify-center px-2" : "px-6"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group" title="Mentivy Dashboard">
            <div className="w-9 h-9 bg-primary-600 group-hover:bg-primary-700 rounded-xl flex items-center justify-center shadow-xs transition-colors shrink-0">
              <span className="text-white font-black text-xl leading-none">M</span>
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">Mentivy</span>
            )}
          </Link>
        </div>

        {/* Middle: Scrollable Navigation Links */}
        <nav className={cn(
          "flex-1 px-3 py-4 space-y-1.5 min-h-0",
          isCollapsed ? "overflow-visible" : "overflow-y-auto"
        )}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  "flex items-center rounded-xl text-sm font-semibold transition-all group relative",
                  isCollapsed ? "justify-center p-3" : "gap-3.5 px-4 py-3",
                  isActive 
                    ? "bg-primary-50 text-primary-700 font-bold border border-primary-100/80 shadow-2xs" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Floating Tooltip with Arrow Pointer on hover in collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap pointer-events-none flex items-center border border-slate-800">
                    <span>{item.name}</span>
                    {/* Tooltip Caret Pointer */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Permanently Pinned & Never Hidden) */}
        <div className={cn(
          "shrink-0 border-t border-slate-100 bg-white sticky bottom-0 z-10",
          isCollapsed ? "p-3 flex flex-col items-center gap-2 overflow-visible" : "p-4 space-y-2"
        )}>
          {/* Expand Button if collapsed */}
          {isCollapsed && setIsCollapsed && (
            <button
              type="button"
              onClick={setIsCollapsed}
              className="p-2.5 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 border border-slate-100 transition cursor-pointer w-full flex justify-center group relative"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap pointer-events-none flex items-center border border-slate-800">
                <span>Expand Sidebar</span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </button>
          )}

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
            title="Sign out"
            aria-label="Sign out"
            className={cn(
              "flex items-center rounded-xl text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full group relative cursor-pointer",
              isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            )}
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600 shrink-0 transition-colors" />
            {!isCollapsed && <span>Sign out</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-red-950 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap pointer-events-none flex items-center border border-red-900">
                <span>Sign out</span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-red-950" />
              </div>
            )}
          </button>
        </div>

      </aside>
    </>
  );
}
