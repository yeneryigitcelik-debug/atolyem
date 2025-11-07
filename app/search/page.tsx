"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("");

  const handleSearch = async (searchQuery?: string, searchCategory?: string) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    const cat = searchCategory !== undefined ? searchCategory : category;
    
    if (!q.trim() && !cat) {
      setResults([]);
      setCategoryName("");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.append("q", q);
      if (cat) params.append("category", cat);
      
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setResults(data.results || []);
      setCategoryName(data.categoryName || "");
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setCategoryName("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // URL parametrelerinden kategori ve query'yi al
    const urlQuery = searchParams.get("q") || "";
    const urlCategory = searchParams.get("category") || "";
    setQuery(urlQuery);
    setCategory(urlCategory);
    
    // Kategori veya query varsa arama yap
    if (urlQuery || urlCategory) {
      handleSearch(urlQuery, urlCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query);
    if (category) params.append("category", category);
    router.push(`/search?${params.toString()}`);
    handleSearch(query, category);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-2">
                  {categoryName ? categoryName : "Arama"}
                </h1>
                {categoryName && (
                  <p className="text-gray-600 mb-8">{categoryName} kategorisindeki ürünler</p>
                )}
                
                <form onSubmit={handleSubmit} className="mb-8">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ürün, kategori veya sanatçı ara..."
                      className="flex-1 rounded-md border border-gray-300 px-4 py-3 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-[#D97706] px-6 py-3 text-white hover:bg-[#92400E] transition-colors font-medium"
                    >
                      Ara
                    </button>
                  </div>
                </form>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Aranıyor...</p>
                  </div>
                ) : (query || category) && results.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      {categoryName 
                        ? `${categoryName} kategorisinde ürün bulunamadı.`
                        : "Aradığınız kriterlere uygun sonuç bulunamadı."}
                    </p>
                  </div>
                ) : results.length > 0 ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      {results.length} {categoryName ? "ürün" : "sonuç"} bulundu
                      {categoryName && ` (${categoryName})`}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="group relative"
                        >
                          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                            <img
                              src={product.images?.[0]?.url || "/uploads/sample.jpg"}
                              alt={product.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="mt-2">
                            <h3 className="text-base font-medium">{product.title}</h3>
                            {product.minPrice > 0 && (
                              <p className="mt-1 text-sm font-semibold text-[#D97706]">
                                {(product.minPrice / 100).toLocaleString("tr-TR")} TL
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Arama yapmak için yukarıdaki alana bir terim girin.</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
            <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
              <Header />
              <main className="flex-1 my-8">
                <div className="max-w-6xl mx-auto px-4">
                  <p className="text-gray-600">Yükleniyor...</p>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

