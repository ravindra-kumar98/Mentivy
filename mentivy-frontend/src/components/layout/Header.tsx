'use client';

import React from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
          Welcome back
          {(user?.fullName || user?.email) && (
            <span className="text-slate-500 font-normal">, {user?.fullName || user?.email?.split('@')[0]}</span>
          )}
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
            <UserIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-700 leading-none capitalize">{user?.role?.toLowerCase() ?? 'Student'}</p>
            <p className="text-xs text-slate-500 mt-1 leading-none truncate max-w-[120px]">
              {user?.email || 'Profile'}
            </p>
          </div>
        </button>

      </div>
    </header>
  );
}
