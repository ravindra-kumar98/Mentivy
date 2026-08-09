'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/store/useAuthStore';
import { loginUser, googleAuthAction } from '@/app/actions/user-actions';
import EmailVerificationModal from '@/components/features/auth/EmailVerificationModal';
import { ForgotPasswordModal } from '@/components/features/auth/ForgotPasswordModal';
import GoogleAuthButton from '@/components/features/auth/GoogleAuthButton';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Email Verification Modal state for unverified accounts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Forgot Password Modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await loginUser(formData);
    if (result.success) {
      if (result.data?.needsVerification) {
        setVerificationEmail(result.data.email);
        setIsModalOpen(true);
      } else if (result.data?.user) {
        setAuth(result.data.user, result.data.accessToken);
        if (result.data.user.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } else {
      setError(result.error || 'Invalid email or password');
    }
    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialOrResponse: any) => {
    const token = typeof credentialOrResponse === 'string' 
      ? credentialOrResponse 
      : (credentialOrResponse?.credential || credentialOrResponse?.access_token);
    
    if (!token) {
      setError('Could not retrieve Google authentication token');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await googleAuthAction(token);
    if (result.success && result.data?.user) {
      setAuth(result.data.user, result.data.accessToken);
      if (result.data.user.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      setError(result.error || 'Google login failed');
    }
    setIsLoading(false);
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1085023940182-test.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Email Verification Modal */}
      <EmailVerificationModal
        email={verificationEmail}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          window.location.href = '/dashboard';
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={formData.email}
      />

      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Google 1-Click Login */}
        <GoogleAuthButton
          mode="signin"
          onSuccess={handleGoogleSuccess}
          onError={(err) => setError(err)}
          isLoading={isLoading}
        />

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            OR
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="student@mentivy.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline focus:outline-none cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
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
          </div>

          <Button type="submit" className="w-full mt-6 cursor-pointer" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary-600 hover:underline font-medium cursor-pointer">
            Create one now
          </Link>
        </div>

        <div className="text-center text-xs text-slate-400 mt-4">
          Protected by Mentivy Security •{' '}
          <Link href="/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
