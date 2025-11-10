"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Category } from "@/lib/data";

interface CategoryMenuProps {
  categories: Category[];
  pathname?: string;
}

export default function CategoryMenu({ categories, pathname }: CategoryMenuProps) {
  const searchParams = useSearchParams();
  
  // Aktif kategoriyi belirle (pathname'den category parametresini çıkar veya /kategori/[slug] kontrolü yap)
  const getActiveCategoryId = () => {
    if (!pathname) return null;
    
    // /kategori/[slug] formatı kontrolü
    if (pathname.startsWith("/kategori/")) {
      const slug = pathname.split("/kategori/")[1]?.split("?")[0];
      const category = categories.find((cat) => cat.slug === slug);
      if (category) return category.id;
      
      // Alt kategorilerde ara
      for (const cat of categories) {
        const child = cat.children?.find((c) => c.slug === slug);
        if (child) return cat.id; // Ana kategoriyi aktif göster
      }
    }
    
    // /search?category=... formatı kontrolü
    if (pathname.startsWith("/search")) {
      const categorySlug = searchParams.get("category");
      if (categorySlug) {
        const category = categories.find((cat) => cat.slug === categorySlug);
        if (category) return category.id;
        
        // Alt kategorilerde ara
        for (const cat of categories) {
          const child = cat.children?.find((c) => c.slug === categorySlug);
          if (child) return cat.id; // Ana kategoriyi aktif göster
        }
      }
    }
    
    return null;
  };

  const activeCategoryId = getActiveCategoryId();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredCategory(null);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white border border-border text-[#1F2937] gap-2 text-sm font-medium leading-normal tracking-[0.015em] min-w-0 px-3 hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined">menu</span>
        <span>Kategoriler</span>
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 rounded-lg bg-white border border-border shadow-xl z-50 overflow-hidden"
          onMouseLeave={() => {
            setHoveredCategory(null);
            setIsOpen(false);
          }}
        >
          <div className="flex min-w-[600px]">
            {/* Ana kategoriler */}
            <div className="w-64 border-r border-gray-200 max-h-[600px] overflow-y-auto bg-gray-50">
              {categories.map((category) => {
                const isActive = activeCategoryId === category.id;
                const isHovered = hoveredCategory === category.id;
                return (
                  <div
                    key={category.id}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    className={`${
                      isHovered || isActive ? "bg-white" : ""
                    } transition-colors`}
                  >
                    <Link
                      href={`/search?category=${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm text-[#1F2937] transition-colors font-medium ${
                        isHovered || isActive
                          ? "text-[#D97706] bg-white"
                          : "hover:bg-white"
                      }`}
                    >
                      {category.name}
                    </Link>
                  </div>
                );
              })}
            </div>
            {/* Alt kategoriler */}
            {hoveredCategory && (
              <div className="w-80 max-h-[600px] overflow-y-auto bg-white">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Alt Kategoriler
                  </p>
                </div>
                {categories
                  .find((cat) => cat.id === hoveredCategory)
                  ?.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={`/search?category=${child.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-[#D97706]/10 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {child.name}
                    </Link>
                  ))}
                {categories.find((cat) => cat.id === hoveredCategory)?.children?.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    Alt kategori bulunmamaktadır
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

