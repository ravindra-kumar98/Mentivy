'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
  { name: 'Overview',   href: '/admin',         icon: LayoutDashboard },
  { name: 'Content CMS', href: '/admin/content', icon: Database },
];

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content (Dark Theme) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:inset-0"
      )}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-8 border-b border-slate-800 shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
              <span className="text-white font-bold text-xl leading-none">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white leading-tight tracking-tight">Mentivy</span>
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            // Precise active matching for root vs sub-routes
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-slate-800 text-sky-400 shadow-md shadow-slate-950/20" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-sky-400" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="px-4 py-3 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">
                {useAuthStore.getState().user?.email?.slice(0, 2).toUpperCase() ?? 'AD'}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-white truncate">{useAuthStore.getState().user?.email ?? 'Administrator'}</span>
              <span className="text-xs text-emerald-400 font-medium">System Online</span>
            </div>
          </div>
          
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-70" />
            Sign out securely
          </button>
        </div>

      </div>
    </>
  );
}
