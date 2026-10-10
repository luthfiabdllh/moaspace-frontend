import { Metadata } from 'next';
import { SubunitsPageContent } from '@/features/subunits/components/subunits-page-content';

export const metadata: Metadata = {
  title: 'Subunit & Posko Dusun | MoaSpace KKN',
  description:
    'Pusat pemetaan wilayah posko dusun KKN, lokasi pemukiman mahasiswa, dan Koordinator Subunit (Kormasit).',
};

export default function SubunitsPage() {
  return <SubunitsPageContent />;
}
