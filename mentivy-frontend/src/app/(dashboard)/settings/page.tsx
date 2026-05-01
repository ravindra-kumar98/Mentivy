import React from 'react';
import { AlertCircle } from 'lucide-react';
import { serverFetch } from '@/lib/server-fetch';
import SettingsUI from '@/components/features/settings/SettingsUI';

export default async function SettingsPage() {
  try {
    const res = await serverFetch('/user/profile');
    const data = res.data;

    return <SettingsUI initialData={data} />;
  } catch (err: any) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">Could not load settings</p>
          <p className="text-slate-500 text-sm mt-1">{err.message}</p>
        </div>
      </div>
    );
  }
}
