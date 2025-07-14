import Link from "next/link";
import { getAllTermSlugs, getTermData } from "@/lib/terms";

export default async function Home() {
  const allTermsData = await Promise.all(
    getAllTermSlugs().map(async ({ params }) => getTermData(params.slug))
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Glosario Geek</h1>
      <p className="mb-8">Explora definiciones y productos recomendados del mundo geek y friki.</p>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar término..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <h2 className="text-2xl font-bold mb-4">Términos Recientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTermsData.map(({ slug, title, description }) => (
          <div key={slug} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link href={`/terms/${slug}`}>
              <h3 className="text-xl font-semibold text-blue-600 hover:underline mb-2">{title}</h3>
            </Link>
            <p className="text-gray-700">{description}</p>
            {/* TODO: Add image thumbnail here */}
          </div>
        ))}
      </div>
    </div>
  );
}
