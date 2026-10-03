import { Metadata } from 'next';
import { CreateEpicContent } from '@/features/epics/components/create-epic-content';

export const metadata: Metadata = {
  title: 'Buat Inisiatif & Epic Baru - MoaSpace',
  description: 'Bentuk inisiatif strategis program kerja dan payungi pecahan deliverable stories di MoaSpace.',
};

export default function NewEpicPage() {
  return (
    <div className="w-full min-w-0 pb-8">
      <CreateEpicContent />
    </div>
  );
}
