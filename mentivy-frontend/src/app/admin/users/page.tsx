import React from 'react';
import AdminUserManagement from '@/components/features/admin/AdminUserManagement';

export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h2>
        <p className="mt-2 text-slate-500">View registered students, review exam preparations, and manage administrator access.</p>
      </div>
      <AdminUserManagement />
    </div>
  );
}
