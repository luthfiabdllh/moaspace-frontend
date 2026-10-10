import { Metadata } from 'next';
import { AnnouncementsPageContent } from '@/features/announcements/components/announcements-page-content';

export const metadata: Metadata = {
  title: 'Pengumuman Tim - MoaSpace',
  description: 'Pusat pengumuman resmi, agenda kegiatan, dan sinkronisasi kalender tim KKN MoaSpace.',
};

export default function AnnouncementsPage() {
  return (
    <div className="w-full min-w-0 pb-8">
      <AnnouncementsPageContent />
    </div>
  );
}
