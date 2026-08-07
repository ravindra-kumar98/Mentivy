'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, Eye, EyeOff, X, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw, Info } from 'lucide-react';
import { changePasswordAction } from '@/app/actions/user-actions';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Password criteria check
  const passwordCriteria = {
    length: newPassword.length >= 6,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Please ensure your new password meets all security criteria.');
      return;
    }
    if (!doPasswordsMatch) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await changePasswordAction({ currentPassword, newPassword });
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while changing password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mb-2 border border-primary-100 mx-auto">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">
                Enter your current password and create a new secure password.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Floating Password Info Tooltip */}
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onMouseEnter={() => setShowPasswordTooltip(true)}
                      onMouseLeave={() => setShowPasswordTooltip(false)}
                      onClick={() => setShowPasswordTooltip(!showPasswordTooltip)}
                      className="text-slate-400 hover:text-primary-600 cursor-pointer transition"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {showPasswordTooltip && (
                      <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl border border-slate-700 z-50 animate-in fade-in zoom-in-95 pointer-events-none">
                        <p className="font-semibold text-slate-300 mb-1.5">Password Requirements:</p>
                        <div className="grid grid-cols-1 gap-1 text-[11px]">
                          <span className={passwordCriteria.length ? 'text-emerald-400' : 'text-slate-400'}>
                            {passwordCriteria.length ? '✓' : '•'} Min 6 characters
                          </span>
                          <span className={passwordCriteria.uppercase ? 'text-emerald-400' : 'text-slate-400'}>
                            {passwordCriteria.uppercase ? '✓' : '•'} At least 1 uppercase (A-Z)
                          </span>
                          <span className={passwordCriteria.lowercase ? 'text-emerald-400' : 'text-slate-400'}>
                            {passwordCriteria.lowercase ? '✓' : '•'} At least 1 lowercase (a-z)
                          </span>
                          <span className={passwordCriteria.number ? 'text-emerald-400' : 'text-slate-400'}>
                            {passwordCriteria.number ? '✓' : '•'} At least 1 number (0-9)
                          </span>
                          <span className={passwordCriteria.special ? 'text-emerald-400' : 'text-slate-400'}>
                            {passwordCriteria.special ? '✓' : '•'} At least 1 special char (!@#$)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-xs text-red-500 font-medium mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                className="w-full mt-2 py-3.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 cursor-pointer transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Password Updated!</h2>
              <p className="text-sm text-slate-500">
                Your account password has been successfully updated.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 cursor-pointer transition duration-200"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
