"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import CategoryMenu from "./CategoryMenu";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface HeaderProps {
  categories?: Category[];
}

export default function Header({ categories: initialCategories }: HeaderProps = {}) {
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Kategorileri API'den çek (eğer prop olarak gelmediyse)
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data.categories || []))
        .catch((err) => console.error("Categories fetch error:", err));
    }
  }, [initialCategories]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="flex w-full items-center justify-between whitespace-nowrap border-b border-solid border-border px-4 md:px-10 py-3">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-4 text-[#1F2937]">
          <div className="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="text-[#1F2937] text-lg font-bold leading-tight tracking-[-0.015em]">
            atolyem.net
          </h2>
        </Link>
        <div className="hidden lg:flex items-center gap-4">
          {categories.length > 0 && <CategoryMenu categories={categories} />}
          <form
            action="/search"
            method="get"
            className="flex flex-col min-w-40 !h-10 max-w-56"
            onSubmit={(e) => {
              const form = e.currentTarget;
              const input = form.querySelector('input[name="q"]') as HTMLInputElement;
              if (!input?.value.trim()) {
                e.preventDefault();
              }
            }}
          >
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-gray-500 flex border-none bg-white border-r border-border items-center justify-center pl-4 rounded-l-lg">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                name="q"
                type="search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1F2937] focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white focus:border-none h-full placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Ara"
                defaultValue=""
              />
            </div>
          </form>
        </div>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="hidden lg:flex items-center gap-9">
          <Link
            href="/pazar"
            className="text-[#1F2937] text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Pazar
          </Link>
          <Link
            href="/akademi"
            className="text-[#1F2937] text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Atölyem Akademi
          </Link>
          {status !== "loading" && session?.user && ((session.user as any)?.role === "SELLER" || (session.user as any)?.role === "ADMIN") ? (
            <Link
              href="/seller"
              className="text-[#1F2937] text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Atölyem
            </Link>
          ) : status !== "loading" ? (
            <Link
              href="/seller"
              className="text-[#1F2937] text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Atölyeni Oluştur
            </Link>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link
            href="/favorites"
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white border border-border text-[#1F2937] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">favorite</span>
          </Link>
          <Link
            href="/cart"
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white border border-border text-[#1F2937] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
          </Link>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white border border-border text-[#1F2937] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">person</span>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-border shadow-xl z-50 overflow-hidden">
                {status === "loading" ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Yükleniyor...</div>
                ) : session?.user ? (
                  <>
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {session.user.name || session.user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{session.user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors font-medium"
                    >
                      Profilim
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors"
                    >
                      Siparişlerim
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors"
                    >
                      Mesajlar
                    </Link>
                    {(session.user as any)?.role === "SELLER" || (session.user as any)?.role === "ADMIN" ? (
                      <Link
                        href="/seller"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors border-t border-border"
                      >
                        Satıcı Paneli
                      </Link>
                    ) : null}
                    {(session.user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors border-t border-border"
                      >
                        Admin Paneli
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors border-t border-border"
                    >
                      Ayarlar
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors"
                    >
                      Yardım Merkezi
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-border font-medium"
                    >
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors font-medium"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-[#1F2937] hover:bg-gray-50 transition-colors border-t border-border font-medium"
                    >
                      Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
