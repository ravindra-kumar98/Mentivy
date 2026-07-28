import React from 'react';
import AdminCMS from '@/components/features/admin/AdminCMS';
import { adminGetTopics } from '@/app/actions/admin-actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const result = await adminGetTopics();
  
  if (!result.success) {
    if (result.error === 'Admin access required.') {
      redirect('/dashboard');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Content CMS</h2>
        <p className="mt-2 text-slate-500">Manage subjects, topics, and question banks.</p>
      </div>
      <AdminCMS initialTopics={result.data || []} />
    </div>
  );
}
