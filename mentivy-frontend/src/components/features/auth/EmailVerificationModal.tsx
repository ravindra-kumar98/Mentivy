'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { verifyEmailAction, resendOtpAction } from '@/app/actions/user-actions';
import { useAuthStore } from '@/store/useAuthStore';

interface EmailVerificationModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmailVerificationModal({
  email,
  isOpen,
  onClose,
  onSuccess
}: EmailVerificationModalProps) {
  const { setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(''));
      setError('');
      setTimer(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = Array(6).fill('');
    pastedData.split('').forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    const result = await verifyEmailAction({ email, otp: fullOtp });
    if (result.success) {
      setAuth(result.data.user, result.data.accessToken);
      onSuccess();
    } else {
      setError(result.error || 'Invalid 6-digit verification code.');
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    setError('');
    const result = await resendOtpAction({ email });
    if (result.success) {
      setTimer(60);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || 'Failed to resend code.');
    }
    setIsResending(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
          <Mail className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your Email</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          We've sent a 6-digit verification code to <br />
          <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">{email}</span>
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {/* 6-Digit OTP Inputs */}
        <form onSubmit={handleVerify} className="mt-6 space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border-2 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all ${
                  digit 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
              />
            ))}
          </div>

          <Button
            type="submit"
            isLoading={isVerifying}
            disabled={otp.join('').length < 6}
            className="w-full h-12 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white cursor-pointer shadow-lg shadow-indigo-500/25 transition duration-200 disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5 mr-2 inline" />
            Verify Email Code
          </Button>
        </form>

        {/* Resend & Change Email Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          >
            Change Email
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className={`font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
              timer > 0 ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
