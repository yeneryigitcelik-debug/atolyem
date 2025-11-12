import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || "admin-secret-key"
);

async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    await jwtVerify(token, ADMIN_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin rotaları - ayrı auth sistemi (login hariç)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = req.cookies.get("admin-session")?.value;
    const isValid = await verifyAdminSession(adminToken);

    if (!isValid) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }

    return NextResponse.next();
  }

  // Seller rotaları
  if (pathname.startsWith("/seller")) {
    // NEXTAUTH_SECRET kontrolü
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET missing in middleware");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Kullanıcı rolünü kontrol et (database bağlantısı yoksa geç)
    let user: { role: string; isPremium?: boolean } | null = null;
    try {
      user = await db.user.findUnique({
        where: { id: token.sub },
        select: { role: true, isPremium: true },
      });

      if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Database error in middleware:", error);
      // Database hatası durumunda giriş sayfasına yönlendir
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Premium özellikler için kontrol (örnek: gelişmiş raporlar)
    const isPremium = user?.isPremium || false;
    if (pathname.startsWith("/seller/advanced") && !isPremium) {
      return NextResponse.redirect(new URL("/premium", req.url));
    }

    return NextResponse.next();
  }

  // Premium rotaları
  if (pathname.startsWith("/premium")) {
    // NEXTAUTH_SECRET kontrolü
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET missing in middleware");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/premium/:path*"],
};

