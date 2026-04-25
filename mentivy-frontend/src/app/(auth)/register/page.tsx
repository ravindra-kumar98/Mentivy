'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiClient, setAccessToken } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
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

    try {
      const res = await apiClient.post('/auth/register', formData);
      setAccessToken(res.data.data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetExam">Target Exam</Label>
          <Input 
            id="targetExam" 
            type="text" 
            placeholder="e.g. SSC CGL"
            value={formData.targetExam}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentLevel">Current Level</Label>
          <select 
            id="currentLevel"
            value={formData.currentLevel}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
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
