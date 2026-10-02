import { Metadata } from 'next';
import { CreateRequestContent } from '@/features/requests/components/create-request-content';

export const metadata: Metadata = {
  title: 'Buat Request Antar Divisi - MoaSpace',
  description: 'Ajukan permohonan kolaborasi atau pengerjaan tugas kepada divisi lain di MoaSpace.',
};

export default function NewRequestPage() {
  return (
    <div className="w-full min-w-0 pb-8">
      <CreateRequestContent />
    </div>
  );
}
