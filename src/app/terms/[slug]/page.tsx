import { getAllTermSlugs, getTermData } from '@/lib/terms';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return getAllTermSlugs(); // ✅ [{ slug: 'geek' }, { slug: 'otaku' }]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const term = getTermData(params.slug);
  if (!term) return {};

  return {
    title: `${term.title} | Glosario Geek`,
    description: term.description,
  };
}

export default function TermPage({ params }: PageProps) {
  const term = getTermData(params.slug);

  if (!term) {
    notFound();
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">{term.title}</h1>
      <article className="prose max-w-none">
        <p>{term.content}</p>
      </article>
    </main>
  );
}