import { Metadata } from 'next';
import { GlobalBoardContent } from '@/features/kanban/components/global-board-content';

export const metadata: Metadata = {
  title: 'Papan Kanban Divisi | MoaSpace',
  description: 'Papan Kanban interaktif divisi kerja dan pelacakan unit tugas di MoaSpace.',
};

export default function BoardPage() {
  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      <GlobalBoardContent />
    </div>
  );
}
