import { Metadata } from 'next';
import { DivisionStoriesContent } from '@/features/stories/components/division-stories-content';

interface StoriesPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: StoriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Stories & Tasks (${slug}) - MoaSpace`,
    description: `Deliverable stories dan unit kerja task divisi ${slug} di MoaSpace.`,
  };
}

export default async function DivisionStoriesPage({ params }: StoriesPageProps) {
  const { slug } = await params;

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <DivisionStoriesContent divisionSlug={slug} />
    </div>
  );
}
