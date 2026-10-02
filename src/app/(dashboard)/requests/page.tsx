import { Metadata } from 'next';
import { RequestsListContent } from '@/features/requests/components/requests-list-content';

export const metadata: Metadata = {
  title: 'Request Antar Divisi - MoaSpace',
  description: 'Kelola alur permohonan kolaborasi dan delegasi tugas antar divisi di MoaSpace.',
};

export default function RequestsPage() {
  return (
    <div className="w-full min-w-0 pb-8">
      <RequestsListContent />
    </div>
  );
}
