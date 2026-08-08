'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Info } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/store/useAuthStore';
import { registerUser, googleAuthAction } from '@/app/actions/user-actions';
import EmailVerificationModal from '@/components/features/auth/EmailVerificationModal';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Email Verification Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'phoneNumber') {
      const numericOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, phoneNumber: numericOnly }));
      if (fieldErrors.phoneNumber) {
        setFieldErrors(prev => ({ ...prev, phoneNumber: undefined }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { fullName?: string; email?: string; phoneNumber?: string; password?: string } = {};

    const nameRegex = /^[a-zA-Z][a-zA-Z\s._-]{1,49}$/;
    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    } else if (!nameRegex.test(formData.fullName.trim())) {
      errors.fullName = 'Full name must start with a letter and contain only letters, spaces, hyphens, or underscores.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const rawPhone = formData.phoneNumber.trim();
    if (rawPhone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(rawPhone)) {
        errors.phoneNumber = 'Please enter a valid 10-digit Indian mobile number (only numbers allowed).';
      }
    }

    const password = formData.password;
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least 1 uppercase letter (A-Z).';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least 1 lowercase letter (a-z).';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least 1 number (0-9).';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.password = 'Password must contain at least 1 special character (e.g. @, #, $, !).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const payload = {
      ...formData,
      phoneNumber: formData.phoneNumber.trim() ? `+91 ${formData.phoneNumber.trim()}` : '',
    };

    const result = await registerUser(payload);
    if (result.success) {
      if (result.data?.needsVerification) {
        setVerificationEmail(result.data.email);
        setIsModalOpen(true);
      } else if (result.data?.user) {
        setAuth(result.data.user, result.data.accessToken);
        window.location.href = '/onboarding';
      }
    } else {
      setServerError(result.error || 'Failed to register');
    }
    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    setServerError('');

    const result = await googleAuthAction(credentialResponse.credential);
    if (result.success && result.data?.user) {
      setAuth(result.data.user, result.data.accessToken);
      window.location.href = '/onboarding';
    } else {
      setServerError(result.error || 'Google authentication failed');
    }
    setIsLoading(false);
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1085023940182-test.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Email Verification Modal Popup */}
      <EmailVerificationModal
        email={verificationEmail}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          window.location.href = '/onboarding';
        }}
      />

      <div className="space-y-4">
        {serverError && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
            {serverError}
          </div>
        )}

        {/* Google 1-Click Sign Up */}
        <div className="flex flex-col items-center justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setServerError('Google sign-up was cancelled or failed')}
            useOneTap={false}
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
            text="signup_with"
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            OR
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Ravindra Kumar"
              value={formData.fullName}
              onChange={handleChange}
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="student@mentivy.com"
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-semibold select-none">
                +91
              </span>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="9876543210"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength={10}
                className="rounded-l-none"
              />
            </div>
            {fieldErrors.phoneNumber && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="inline-flex items-center gap-1.5">
                <span>Password</span>

                {/* Password Criteria Info Tooltip */}
                <div ref={tooltipRef} className="relative inline-flex items-center group">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTooltip(prev => !prev);
                    }}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    aria-label="Password requirements info"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {/* Floating Tooltip Box */}
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 transition-all duration-200 z-50 ${showTooltip ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                    }`}>
                    <p className="font-semibold mb-1 text-slate-200">Password Must Contain:</p>
                    <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                      <li>At least 6 characters</li>
                      <li>At least 1 uppercase letter (A-Z)</li>
                      <li>At least 1 lowercase letter (a-z)</li>
                      <li>At least 1 number (0-9)</li>
                      <li>At least 1 special char (@, #, $, !, etc.)</li>
                    </ul>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                </div>

                <span className="text-red-500">*</span>
              </Label>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-6 cursor-pointer" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:underline font-medium cursor-pointer">
            Log in here
          </Link>
        </div>

        <div className="text-center text-xs text-slate-400 mt-4">
          By signing up, you agree to our{' '}
          <Link href="/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
