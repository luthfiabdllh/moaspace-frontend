import { Metadata } from 'next';
import { RequestDetailContent } from '@/features/requests/components/request-detail-content';

export const metadata: Metadata = {
  title: 'Detail Request Antar Divisi - MoaSpace',
  description: 'Pantau status pengerjaan, rincian brief, dan riwayat lifecycle permohonan di MoaSpace.',
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <RequestDetailContent requestId={id} />
    </div>
  );
}
