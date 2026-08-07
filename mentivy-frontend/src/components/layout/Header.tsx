'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Student';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
          Welcome back
          {displayName && (
            <span className="text-slate-500 font-normal">, {displayName}</span>
          )}
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        <button 
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative cursor-pointer transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <Link 
          href="/settings"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer p-1 rounded-xl"
        >
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200 text-primary-700 font-bold text-sm overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-none capitalize truncate max-w-[130px]">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-none truncate max-w-[130px]">
              {user?.email || 'Profile'}
            </p>
          </div>
        </Link>

      </div>
    </header>
  );
}
