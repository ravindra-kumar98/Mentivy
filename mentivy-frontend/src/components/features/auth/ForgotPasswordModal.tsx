'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft, RefreshCw, X, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { forgotPasswordAction, resetPasswordAction } from '@/app/actions/user-actions';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, initialEmail = '', onSuccess }: ForgotPasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  // Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  // Step 1: Send Reset Code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await forgotPasswordAction(email.trim());
      if (res.success) {
        setStep(2);
        setResendCooldown(60);
      } else {
        setErrorMessage(res.error || 'Failed to send reset code. Please check your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Reset Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await forgotPasswordAction(email.trim());
      if (res.success) {
        setResendCooldown(60);
      } else {
        setErrorMessage(res.error || 'Failed to resend reset code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Inputs
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = otp.join('');
    if (pin.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit PIN.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Please ensure your new password meets all security requirements.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await resetPasswordAction({
        email: email.trim(),
        otp: pin,
        newPassword
      });

      if (res.success) {
        setStep(3);
      } else {
        setErrorMessage(res.error || 'Failed to reset password. Please check your PIN.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setStep(1);
    setErrorMessage('');
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    onClose();
    if (step === 3 && onSuccess) {
      onSuccess();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-2 border border-indigo-100 dark:border-indigo-900/50 mx-auto">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your registered email address and we'll send you a 6-digit reset code.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: OTP + NEW PASSWORD */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-2 border border-indigo-100 dark:border-indigo-900/50 mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Your Password</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter the 6-digit PIN sent to <strong className="text-slate-700 dark:text-slate-300 break-all">{email}</strong> and create your new password.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* 6-digit PIN Inputs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
                  6-Digit Verification PIN
                </label>
                <div className="flex justify-between gap-2 my-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend PIN'}
                  </button>
                </div>
              </div>

              {/* New Password Input */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    New Password
                  </label>
                  
                  {/* Password Info Floating Tooltip Trigger */}
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onMouseEnter={() => setShowPasswordTooltip(true)}
                      onMouseLeave={() => setShowPasswordTooltip(false)}
                      onClick={() => setShowPasswordTooltip(!showPasswordTooltip)}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {/* Floating Tooltip */}
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div className="text-center space-y-6 py-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Password Reset Successfully!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your account password has been updated. You can now log in using your new credentials.
              </p>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer transition duration-200"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
