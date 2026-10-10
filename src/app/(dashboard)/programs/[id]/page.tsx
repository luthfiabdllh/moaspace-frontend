import { Metadata } from 'next';
import { ProgramDetailPageContent } from '@/features/programs/components/program-detail-page-content';

export const metadata: Metadata = {
  title: 'Detail Program Kerja | MoaSpace',
  description: 'Rincian program kerja KKN, status approval, daftar epics, dan tim pelaksana.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProgramDetailPageContent programId={id} />;
}
