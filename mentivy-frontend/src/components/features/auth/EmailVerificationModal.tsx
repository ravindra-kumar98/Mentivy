'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  if (!isOpen) return null;

  const handleInputChange = (index: number, value: string) => {
    // Only accept numeric digits
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

    // Auto-advance focus to next input
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

    // Focus last or next empty
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100">
          <Mail className="w-7 h-7 text-primary-600" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900">Verify Your Email</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          We've sent a 6-digit verification code to <br />
          <span className="font-semibold text-slate-800 break-all">{email}</span>
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
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
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-800 bg-slate-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all ${
                  digit 
                    ? 'border-primary-600 bg-primary-50/50' 
                    : 'border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-150'
                }`}
              />
            ))}
          </div>

          <Button
            type="submit"
            isLoading={isVerifying}
            disabled={otp.join('').length < 6}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            <ShieldCheck className="w-5 h-5 mr-2 inline" />
            Verify Email Code
          </Button>
        </form>

        {/* Resend & Change Email Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Change Email
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className={`font-semibold inline-flex items-center gap-1 transition-colors ${
              timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
          </button>
        </div>

      </div>
    </div>
  );
}
