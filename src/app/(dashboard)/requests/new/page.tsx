import { Metadata } from 'next';
import { CreateRequestContent } from '@/features/requests/components/create-request-content';

export const metadata: Metadata = {
  title: 'Buat Request Antar Divisi - MoaSpace',
  description: 'Ajukan permohonan kolaborasi atau pengerjaan tugas kepada divisi lain di MoaSpace.',
};

export default function NewRequestPage() {
  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <CreateRequestContent />
    </div>
  );
}
