"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SearchTerm {
  slug: string;
  title: string;
  description: string;
}

export default function HomePageClient({ allTermsData }: { allTermsData: SearchTerm[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTerms, setFilteredTerms] = useState<SearchTerm[]>(allTermsData);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredTerms(allTermsData);
      return;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = allTermsData.filter(
      (term) =>
        term.title.toLowerCase().includes(lowercasedSearchTerm) ||
        term.description.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredTerms(results);
  }, [searchTerm, allTermsData]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-6 text-purple-400">Glosario Geek</h1>
      <p className="mb-8 text-gray-300">Explora definiciones y productos recomendados del mundo geek y friki.</p>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar término..."
          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h2 className="text-3xl font-bold mb-4 text-purple-300">Términos Recientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTerms.length > 0 ? (
          filteredTerms.map(({ slug, title, description }) => (
            <div key={slug} className="border border-gray-700 rounded-lg p-4 shadow-lg bg-gray-700 hover:bg-gray-600 transition-all duration-300">
              <Link href={`/terms/${slug}`}>
                <h3 className="text-xl font-semibold text-purple-200 hover:text-purple-100 hover:underline mb-2">{title}</h3>
              </Link>
              <p className="text-gray-300 text-sm">{description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No se encontraron términos que coincidan con la búsqueda.</p>
        )}
      </div>
    </div>
  );
}
