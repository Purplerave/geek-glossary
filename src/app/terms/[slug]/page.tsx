import { getAllTermSlugs, getTermData, getAllTermTitlesAndSlugs } from '@/lib/server-utils';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Term } from '@/lib/types';
import { processMarkdownToHtml } from '@/lib/terms';
import Link from "next/link";
import { getRandomRelatedTerms } from '@/lib/client-utils';

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



// ... (resto del código)

export default async function TermPage({ params }: PageProps) {
  const term = getTermData(params.slug) as Term | undefined;

  if (!term) {
    notFound();
  }

  const allTerms = await getAllTermTitlesAndSlugs();
  const contentHtml = await processMarkdownToHtml(term.content, allTerms);
  const relatedTerms = getRandomRelatedTerms(allTerms, params.slug, 5);

  return (
    <main className="p-6 bg-gray-800 rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold mb-4 text-purple-400">{term.title}</h1>
      <article className="prose prose-invert max-w-none text-gray-200">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>

      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">Productos Relacionados en Amazon</h2>
        {term.optimizedAmazonSearch ? (
          <a
            href={`https://www.amazon.es/s?k=${encodeURIComponent(term.optimizedAmazonSearch)}&tag=mrpurple0b-21`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105"
          >
            Buscar productos relacionados en Amazon: {term.optimizedAmazonSearch}
          </a>
        ) : term.amazonKeywords && term.amazonKeywords.length > 0 ? (
          <a
            href={`https://www.amazon.es/s?k=${term.amazonKeywords.map(keyword => encodeURIComponent(keyword)).join('+')}&tag=mrpurple0b-21`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105"
          >
            Buscar productos relacionados en Amazon
          </a>
        ) : (
          <p className="text-gray-300">No hay productos de Amazon directamente relevantes para este término.</p>
        )}
      </div>

      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">Compartir</h2>
        <p className="text-gray-300">Botones para compartir en redes sociales.</p>
        {/* TODO: Implement social share buttons */}
      </div>

      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">Ver También</h2>
        <ul className="list-disc list-inside text-gray-300">
          {relatedTerms.map((relatedTerm) => (
            <li key={relatedTerm.slug}>
              <Link href={`/terms/${relatedTerm.slug}`} className="text-purple-200 hover:underline">
                {relatedTerm.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}




