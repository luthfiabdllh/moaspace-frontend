import { Metadata } from 'next';
import { RequestsListContent } from '@/features/requests/components/requests-list-content';

export const metadata: Metadata = {
  title: 'Request Antar Divisi - MoaSpace',
  description: 'Kelola alur permohonan kolaborasi dan delegasi tugas antar divisi di MoaSpace.',
};

export default function RequestsPage() {
  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <RequestsListContent />
    </div>
  );
}
