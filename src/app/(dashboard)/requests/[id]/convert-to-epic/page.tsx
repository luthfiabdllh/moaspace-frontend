import { Metadata } from 'next';
import { ConvertToEpicContent } from '@/features/requests/components/convert-to-epic-content';

export const metadata: Metadata = {
  title: 'Jadikan Inisiatif / Epic - MoaSpace',
  description: 'Tingkatkan permohonan kolaborasi menjadi Inisiatif Strategis / Epic tingkat program kerja di MoaSpace.',
};

export default async function ConvertRequestToEpicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full min-w-0 pb-8">
      <ConvertToEpicContent requestId={id} />
    </div>
  );
}
