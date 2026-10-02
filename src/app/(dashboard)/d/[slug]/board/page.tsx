import { Metadata } from 'next';
import { DivisionBoardContent } from '@/features/kanban/components/division-board-content';

interface BoardPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BoardPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Papan Kanban (${slug}) - MoaSpace`,
    description: `Papan Kanban interaktif divisi ${slug} di MoaSpace.`,
  };
}

export default async function DivisionBoardPage({ params }: BoardPageProps) {
  const { slug } = await params;

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      <DivisionBoardContent divisionSlug={slug} />
    </div>
  );
}
