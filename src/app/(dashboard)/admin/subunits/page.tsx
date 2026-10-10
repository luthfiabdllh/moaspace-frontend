import { Metadata } from 'next';
import { SubunitsPageContent } from '@/features/subunits/components/subunits-page-content';

export const metadata: Metadata = {
  title: 'Kelola Subunit & Posko | Administrasi MoaSpace',
  description: 'Kelola alokasi posko dusun, data Kormasit, dan distribusi mahasiswa KKN.',
};

export default function AdminSubunitsPage() {
  return <SubunitsPageContent />;
}
