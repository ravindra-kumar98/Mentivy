import React, { Suspense } from 'react';
import { serverFetch } from '@/lib/server-fetch';
import PracticeClientUI from '@/components/features/practice/PracticeClientUI';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PracticePage() {
  let initialTopics: any[] = [];

  try {
    const res = await serverFetch('/questions/topics');
    if (Array.isArray(res?.data)) {
      initialTopics = res.data;
    }
  } catch (error) {
    console.error('Failed to pre-fetch topics on server:', error);
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <p className="text-slate-500 font-medium">Loading practice arena...</p>
        </div>
      }
    >
      <PracticeClientUI initialTopics={initialTopics} />
    </Suspense>
  );
}
