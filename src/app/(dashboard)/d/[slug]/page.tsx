import { Metadata } from 'next';
import { DivisionWorkspaceContent } from '@/features/divisions/components/division-workspace-content';

interface DivisionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: DivisionPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Ruang Kerja Divisi (${slug}) - MoaSpace`,
    description: `Papan Kanban dan hierarki pemecahan tugas divisi ${slug} di MoaSpace.`,
  };
}

export default async function DivisionPage({ params }: DivisionPageProps) {
  const { slug } = await params;

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <DivisionWorkspaceContent divisionSlug={slug} initialTab="KANBAN" />
    </div>
  );
}
