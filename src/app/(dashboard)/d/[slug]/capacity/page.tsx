import { Metadata } from 'next';
import { DivisionCapacityContent } from '@/features/capacity/components/division-capacity-content';

interface CapacityPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CapacityPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Kapasitas & Beban Kerja (${slug}) - MoaSpace`,
    description: `Pantau kapasitas mingguan dan beban kerja anggota divisi ${slug} di MoaSpace.`,
  };
}

export default async function DivisionCapacityPage({ params }: CapacityPageProps) {
  const { slug } = await params;

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <DivisionCapacityContent slug={slug} />
    </div>
  );
}
