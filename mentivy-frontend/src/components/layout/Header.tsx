'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Header({ onMenuClick, isCollapsed = false, onToggleCollapse }: HeaderProps) {
  const { user } = useAuthStore();

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Student';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-2xs">
      
      {/* Left: Sidebar Collapse Button & Workspace Status */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button 
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop Sidebar Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200"
          title={isCollapsed ? "Expand Sidebar" : "Collapse to Icons"}
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5 text-primary-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-500" />
          )}
          <span className="text-xs font-semibold text-slate-500 hidden xl:inline">
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>

        <div className="h-5 w-px bg-slate-200 hidden lg:block" />

        {/* Platform Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          <span>Mentivy Learning Workspace</span>
        </div>
      </div>

      {/* Right Actions: Interactive Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Live Notification Dropdown */}
        <NotificationDropdown />

        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

        <Link 
          href="/settings"
          className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200 text-primary-700 font-bold text-sm overflow-hidden group-hover:ring-2 group-hover:ring-primary-200 transition-all">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="hidden sm:block text-left pr-1">
            <p className="text-xs font-bold text-slate-900 leading-tight capitalize truncate max-w-[130px]">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-400 font-medium leading-tight truncate max-w-[130px] mt-0.5">
              {user?.email || 'Profile Settings'}
            </p>
          </div>
        </Link>

      </div>
    </header>
  );
}
