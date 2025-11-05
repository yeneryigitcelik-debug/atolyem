// app/layout.tsx — Server Component: oturum durumuna göre header butonları
import "./globals.css";                                // varsa global css'in
import Link from "next/link";
import { getServerSession } from "next-auth";          // sunucuda session almak için
import { authOptions } from "@/lib/auth";              // NextAuth ayarlarımız

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions); // ← aktif oturumu alır

  return (
    <html lang="tr">
      <body className="font-display">
        {/* ÜST BAR: Stitch header'ını burada basitçe örnekliyorum.
           Kendi Stitch header HTML'ini buraya taşıyabilir ya da app/page.tsx'teki header'ı sadeleştirebilirsin. */}
        <header className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">Atölyem.net</Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/">Keşfet</Link>
              <Link href="/">Koleksiyonlar</Link>
              <Link href="/">Atölye Başla</Link>
            </nav>
          </div>

          {/* Sağ bölüm: oturum yoksa Login/Register; varsa karşılama + Admin + Çıkış */}
          <nav className="flex items-center gap-3">
            {!session ? (
              <>
                <Link href="/login" className="underline text-sm">Giriş</Link>
                <Link href="/(auth)/register" className="underline text-sm">Kayıt</Link>
              </>
            ) : (
              <>
                <span className="text-sm">
                  Merhaba, {session.user?.name || session.user?.email}
                </span>
                <Link href="/admin" className="underline text-sm">Admin</Link>
                {/* Çıkış için NextAuth'un POST endpoint'i */}
                <form action="/api/auth/signout" method="post">
                  <button className="border px-3 py-1 text-sm">Çıkış</button>
                </form>
              </>
            )}
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}

