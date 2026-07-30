'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/store/useAuthStore';
import { loginUser } from '@/app/actions/user-actions';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await loginUser(formData);
    if (result.success) {
      setAuth(result.data.user, result.data.accessToken);
      if (result.data.user.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      setError(result.error || 'Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}
      
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
          required 
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <a href="#" className="text-xs text-primary-600 hover:underline">Forgot?</a>
        </div>
        <div className="relative">
          <Input 
            id="password" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required 
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
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
      
      <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
        Sign In
      </Button>

      <div className="text-center mt-6 text-sm text-slate-500">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary-600 hover:underline font-medium">
          Create one now
        </Link>
      </div>
    </form>
  );
}
