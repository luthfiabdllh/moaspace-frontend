import { Metadata } from 'next';
import { ProgramsPageContent } from '@/features/programs/components/programs-page-content';

export const metadata: Metadata = {
  title: 'Program Kerja KKN | MoaSpace',
  description:
    'Manajemen program kerja KKN, alur approval paralel Kormater & Kormasit, serta pemantauan eksekusi kerja tingkat unit dan posko dusun.',
};

export default function ProgramsPage() {
  return <ProgramsPageContent />;
}
