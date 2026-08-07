'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  X, 
  Trash2, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  RefreshCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { deleteAccountAction } from '@/app/actions/user-actions';
import { useAuthStore } from '@/store/useAuthStore';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail
}: DeleteAccountModalProps) {
  const { logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Deletion progress state
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletionStep, setDeletionStep] = useState('Permanently erasing account & learning records...');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmEmail('');
      setIsConfirmed(false);
      setErrorMessage('');
      setIsLoading(false);
      setIsDeleted(false);
      setDeletionStep('Permanently erasing account & learning records...');
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      setErrorMessage('Please confirm that you understand this action is permanent.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await deleteAccountAction({
        password: password || undefined,
        confirmEmail: confirmEmail.trim() || undefined
      });

      if (res.success) {
        setIsDeleted(true);
        
        // Animated step progression during full-screen blurred overlay
        setTimeout(() => {
          setDeletionStep('Revoking authentication sessions & tokens...');
        }, 700);

        setTimeout(() => {
          setDeletionStep('Account deleted successfully. Redirecting to login...');
        }, 1400);

        setTimeout(async () => {
          await logout();
          window.location.replace('/login?deleted=true');
        }, 2100);

      } else {
        setErrorMessage(res.error || 'Failed to delete account. Please verify your credentials.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while deleting your account.');
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-500 ${
      isLoading || isDeleted 
        ? 'bg-slate-950/85 backdrop-blur-xl' 
        : 'bg-slate-900/65 backdrop-blur-sm'
    }`}>
      
      {/* FULL-SCREEN IMMERSIVE LOADER (Hides entire background during deletion & redirect) */}
      {isLoading || isDeleted ? (
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Clean Modern Theme Spinner */}
          <div className="flex items-center justify-center py-2">
            <div className="w-14 h-14 rounded-full border-3 border-primary-100 border-t-primary-600 animate-spin"></div>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Deleting Account</h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>{deletionStep}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto pt-2 leading-relaxed">
              Please wait while we safely scrub your database records and sign you out.
            </p>
          </div>

        </div>
      ) : (
        /* CONFIRMATION FORM VIEW */
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-100 p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-5">
            
            {/* Warning Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-600 mb-1 border border-red-200 mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Delete Your Account?</h2>
              <p className="text-sm text-slate-500">
                This action is <strong className="text-red-600 font-semibold">permanent</strong> and will irreversibly erase your data.
              </p>
            </div>

            {/* Warning Checklist Box */}
            <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-4 text-xs text-red-900 space-y-2">
              <p className="font-bold uppercase tracking-wider text-[11px] text-red-700">What will be permanently deleted:</p>
              <ul className="space-y-1.5 list-disc list-inside text-red-800">
                <li>Your profile, name, phone number, and personal settings.</li>
                <li>All Spaced Repetition (SRS) memory cards and learning progress.</li>
                <li>Daily study streaks, mock test scores, and analytics history.</li>
              </ul>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              
              {/* Security Verification: Password or Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Enter Current Password or Confirm Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Or confirm with your account email: <span className="font-mono font-medium text-slate-600">{userEmail}</span>
                </p>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={`Type ${userEmail}`}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-xs"
                />
              </div>

              {/* Strict Confirmation Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  I understand that deleting my account is <strong className="text-slate-900 font-bold">permanent</strong> and my learning data cannot be recovered.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!isConfirmed || (!password && !confirmEmail)}
                  className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm shadow-md shadow-red-500/25 cursor-pointer transition duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete Account</span>
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );

  return createPortal(modalContent, document.body);
}
