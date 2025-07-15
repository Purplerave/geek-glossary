import { getAllTermSlugs, getTermData } from '@/lib/terms';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Term } from '@/lib/types';
import { remark } from 'remark';
import html from 'remark-html';

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return getAllTermSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const term = getTermData(params.slug) as Term | undefined;
  if (!term) return {};

  return {
    title: `${term.title} | Glosario Geek`,
    description: term.description,
  };
}

export default async function TermPage({ params }: PageProps) {
  const term = getTermData(params.slug) as Term | undefined;

  if (!term) {
    notFound();
  }

  const processedContent = await remark()
    .use(html)
    .process(term.content);
  const contentHtml = processedContent.toString();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">{term.title}</h1>
      <article className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>

      <div className="mt-8 p-4 border rounded-lg bg-gray-100">
        <h2 className="text-xl font-bold mb-2">Productos Relacionados en Amazon</h2>
        <a
          href={`https://www.amazon.es/s?k=${term.amazonKeywords?.map(keyword => encodeURIComponent(keyword)).join('+')}&tag=YOUR_ASSOCIATE_ID`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
        >
          Buscar productos relacionados en Amazon
        </a>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Compartir</h2>
        <p>Botones para compartir en redes sociales.</p>
      </div>
    </main>
  );
}
