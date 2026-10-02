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
    <div className="w-full min-w-0 pb-8">
      <RequestDetailContent requestId={id} />
    </div>
  );
}
