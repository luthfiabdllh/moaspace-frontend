import { Metadata } from 'next';
import { EpicDetailContent } from '@/features/epics/components/epic-detail-content';

export const metadata: Metadata = {
  title: 'Detail Inisiatif & Epic - MoaSpace',
  description: 'Pantau sasaran strategis, pecahan deliverable stories, dan progres pelaksanaan inisiatif di MoaSpace.',
};

export default async function EpicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full min-w-0 pb-8">
      <EpicDetailContent epicId={id} />
    </div>
  );
}
