'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Flame, 
  Trophy, 
  X, 
  Check, 
  Loader2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  _id: string;
  type: 'SRS_REVISION' | 'WEAK_ALERT' | 'STREAK_GOAL' | 'MOCK_RESULT' | 'ANNOUNCEMENT';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'REVISION' | 'ALERTS'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dismiss notification
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      const wasUnread = notifications.find(n => n._id === id)?.isRead === false;
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(item => {
    if (filter === 'UNREAD') return !item.isRead;
    if (filter === 'REVISION') return item.type === 'SRS_REVISION';
    if (filter === 'ALERTS') return item.type === 'WEAK_ALERT' || item.type === 'STREAK_GOAL';
    return true;
  });

  const getTypeConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SRS_REVISION':
        return {
          icon: Zap,
          bg: 'bg-primary-50 text-primary-700 border-primary-200',
          badge: 'SRS Review'
        };
      case 'WEAK_ALERT':
        return {
          icon: AlertTriangle,
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          badge: 'Weak Focus'
        };
      case 'STREAK_GOAL':
        return {
          icon: Flame,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badge: 'Daily Streak'
        };
      case 'MOCK_RESULT':
        return {
          icon: Trophy,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badge: 'Mock Test'
        };
      default:
        return {
          icon: Sparkles,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          badge: 'System'
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Icon Trigger */}
      <button 
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={cn(
          "p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 relative cursor-pointer transition-all border",
          isOpen ? "bg-slate-100 text-slate-900 border-slate-200" : "border-transparent hover:border-slate-200"
        )}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="min-w-4 h-4 px-1 rounded-full bg-primary-600 text-white text-[10px] font-black absolute top-1 right-1 flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Flyout Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[520px]">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-200">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {(['ALL', 'UNREAD', 'REVISION', 'ALERTS'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0",
                  filter === tab 
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab === 'ALL' ? 'All' : tab === 'UNREAD' ? 'Unread' : tab === 'REVISION' ? 'SRS Reviews' : 'Alerts'}
              </button>
            ))}
          </div>

          {/* Notification List (Scrollable) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2 px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-1">You&apos;re all caught up! 🎉</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  No unread alerts in this view. Keep practicing to maintain your spaced repetition schedule.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const config = getTypeConfig(item.type);
                const IconComponent = config.icon;

                return (
                  <div
                    key={item._id}
                    onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                    className={cn(
                      "p-3.5 rounded-2xl transition-all relative group flex gap-3 cursor-pointer",
                      item.isRead 
                        ? "bg-white hover:bg-slate-50 opacity-80 hover:opacity-100" 
                        : "bg-primary-50/40 hover:bg-primary-50/70 border border-primary-100/60 shadow-2xs"
                    )}
                  >
                    {/* Icon Badge */}
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                      config.bg
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className={cn(
                          "text-xs truncate font-bold text-slate-900",
                          !item.isRead && "text-primary-950 font-black"
                        )}>
                          {item.title}
                        </h5>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary-600" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(item._id, e)}
                            className="p-1 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      {/* Action Button */}
                      {item.actionUrl && (
                        <div className="pt-1 flex items-center justify-between">
                          <Link
                            href={item.actionUrl}
                            onClick={() => {
                              handleMarkAsRead(item._id);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 hover:text-primary-800 transition"
                          >
                            <span>{item.actionLabel || 'Review Now'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
            <Link
              href="/study-plan"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 block transition"
            >
              Open Spaced Repetition Plan →
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
