import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "./components/SessionProviderWrapper";
import HeaderWrapper from "./components/HeaderWrapper";
import { ToastProvider } from "./components/ui/ToastProvider";
import { getCategories } from "@/lib/data";
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
  // Kategorileri ve session'ı sunucuda çek
  const [categories, session] = await Promise.all([
    getCategories(),
    getServerSession(authOptions),
  ]);

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

