import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GlobalBoardContent } from '@/features/kanban/components/global-board-content';

export const metadata: Metadata = {
  title: 'Papan Kanban Divisi | MoaSpace',
  description: 'Papan Kanban interaktif divisi kerja dan pelacakan unit tugas di MoaSpace.',
};

interface BoardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const params = await searchParams;

  if (!params.tab) {
    const query = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === 'string') {
        query.set(key, val);
      } else if (Array.isArray(val) && val[0]) {
        query.set(key, val[0]);
      }
    }
    query.set('tab', 'kanban');
    redirect(`/board?${query.toString()}`);
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      <GlobalBoardContent />
    </div>
  );
}
