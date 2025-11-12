import type { Metadata } from "next";
import type { Session } from "next-auth";
import "./globals.css";
import SessionProviderWrapper from "./components/SessionProviderWrapper";
import HeaderWrapper from "./components/HeaderWrapper";
import { ToastProvider } from "./components/ui/ToastProvider";
import { getCategories, type Category } from "@/lib/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "atolyem.net - El Yapımı Türk Sanatını Keşfedin",
  description: "Yetenekli zanaatkarlardan eşsiz eserler, kapınıza gelsin.",
};

// Route-level revalidate: 300 saniye
export const revalidate = 300;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Kategorileri ve session'ı sunucuda çek (hata durumunda fallback)
  let categories: Category[] = [];
  let session: Session | null = null;
  
  try {
    // Database bağlantısı ve environment variables kontrolü
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is missing!");
    }
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET environment variable is missing!");
    }
    
    [categories, session] = await Promise.all([
      getCategories().catch((err) => {
        console.error("Error fetching categories:", err);
        return [] as Category[];
      }),
      getServerSession(authOptions).catch((err) => {
        console.error("Error fetching session:", err);
        return null;
      }),
    ]);
  } catch (error) {
    console.error("Layout initialization error:", error);
    // Fallback değerler kullanılıyor - site yine de çalışmalı
  }

  return (
    <html className="light" lang="tr" style={{ backgroundColor: '#FFF8F1' }}>
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="font-display" style={{ backgroundColor: '#FFF8F1', color: '#1F2937' }}>
        <SessionProviderWrapper>
          <ToastProvider>
            <HeaderWrapper categories={categories} session={session} />
            {children}
          </ToastProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

