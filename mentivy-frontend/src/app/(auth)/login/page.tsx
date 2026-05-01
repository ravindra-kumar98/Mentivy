'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
      window.location.href = '/dashboard';
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
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="name@example.com" 
          value={formData.email}
          onChange={handleChange}
          required 
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-xs text-primary-600 hover:underline">Forgot?</a>
        </div>
        <Input 
          id="password" 
          type="password" 
          value={formData.password}
          onChange={handleChange}
          required 
        />
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
