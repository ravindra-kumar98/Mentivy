'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/store/useAuthStore';
import { registerUser } from '@/app/actions/user-actions';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    targetExam: '',
    currentLevel: 'BEGINNER'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await registerUser(formData);
    if (result.success) {
      setAuth(result.data.user, result.data.accessToken);
      window.location.href = '/dashboard';
    } else {
      setError(result.error || 'Failed to register');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
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
          placeholder="student@mentivy.com" 
          value={formData.email}
          onChange={handleChange}
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="Minimum 6 characters"
          value={formData.password}
          onChange={handleChange}
          required 
          minLength={6}
        />
      </div>

      <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
        Create Account
      </Button>

      <div className="text-center mt-6 text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:underline font-medium">
          Log in here
        </Link>
      </div>
    </form>
  );
}
