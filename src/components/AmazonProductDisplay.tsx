"use client";

import { useState, useEffect } from "react";

interface AmazonProductDisplayProps {
  amazonKeywords: string[];
  associateId: string;
}

interface OptimizedSearchData {
  relevant: boolean;
  optimizedSearchString?: string;
}

export default function AmazonProductDisplay({ amazonKeywords, associateId }: AmazonProductDisplayProps) {
  const [optimizedSearchData, setOptimizedSearchData] = useState<OptimizedSearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptimizedSearch() {
      try {
        const response = await fetch("/.netlify/functions/optimize-amazon-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amazonKeywords }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OptimizedSearchData = await response.json();
        setOptimizedSearchData(data);
      } catch (err: any) {
        console.error("Error calling Netlify Function:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (amazonKeywords && amazonKeywords.length > 0) {
      fetchOptimizedSearch();
    } else {
      setLoading(false);
      setOptimizedSearchData({ relevant: false });
    }
  }, [amazonKeywords]);

  if (loading) {
    return (
      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">Productos Relacionados en Amazon</h2>
        <p className="text-gray-300">Cargando sugerencias de productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">Productos Relacionados en Amazon</h2>
        <p className="text-red-400">Error al cargar sugerencias de productos: {error}</p>
      </div>
    );
  }

  if (optimizedSearchData?.relevant && optimizedSearchData.optimizedSearchString) {
    return (
      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">Productos Relacionados en Amazon</h2>
        <a
          href={`https://www.amazon.es/s?k=${encodeURIComponent(optimizedSearchData.optimizedSearchString)}&tag=${associateId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105"
        >
          Buscar productos relacionados en Amazon
        </a>
      </div>
    );
  } else {
    return (
      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-300">Productos Relacionados en Amazon</h2>
        <p className="text-gray-300">No hay productos de Amazon directamente relevantes para este término.</p>
      </div>
    );
  }
}
