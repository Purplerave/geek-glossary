import { getAllTermSlugs, getTermData } from '@/lib/terms';
import { Metadata } from 'next';

type Props = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateStaticParams() {
  const slugs = getAllTermSlugs();
  return slugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const termData = await getTermData(params.slug);
  return {
    title: termData.title,
    description: termData.description,
  };
}

export default async function TermPage({ params }: Props) {
  const termData = await getTermData(params.slug);

  return (
    <div className="prose lg:prose-xl mx-auto">
      <h1>{termData.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: termData.contentHtml }} />

      <div className="mt-8 p-4 border rounded-lg bg-gray-100">
        <h2 className="text-xl font-bold mb-2">Productos Relacionados en Amazon</h2>
        <a
          href={`https://www.amazon.es/s?k=${termData.amazonKeywords.map(keyword => encodeURIComponent(keyword)).join('+')}&tag=YOUR_ASSOCIATE_ID`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
        >
          Buscar productos relacionados en Amazon
        </a>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Compartir</h2>
        {/* TODO: Implement social share buttons */}
        <p>Botones para compartir en redes sociales.</p>
      </div>
    </div>
  );
}
