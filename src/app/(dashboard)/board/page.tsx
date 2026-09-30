import { Metadata } from 'next';
import { GlobalBoardContent } from '@/features/kanban/components/global-board-content';

export const metadata: Metadata = {
  title: 'Papan Kanban Divisi | MoaSpace',
  description: 'Papan Kanban interaktif divisi kerja dan pelacakan unit tugas di MoaSpace.',
};

export default function BoardPage() {
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <GlobalBoardContent />
    </div>
  );
}
