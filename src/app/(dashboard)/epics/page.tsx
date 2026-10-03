import { Suspense } from 'react';
import { Metadata } from 'next';
import { EpicsPageContent } from '@/features/epics/components/epics-page-content';

export const metadata: Metadata = {
  title: 'Inisiatif & Epics - MoaSpace',
  description: 'Pantau dan kelola inisiatif strategis divisi serta kolaborasi lintas divisi di MoaSpace.',
};

export default function EpicsPage() {
  return (
    <div className="w-full min-w-0 pb-8 space-y-6">
      <Suspense fallback={<div className="h-64 rounded-2xl bg-card border animate-pulse" />}>
        <EpicsPageContent />
      </Suspense>
    </div>
  );
}
