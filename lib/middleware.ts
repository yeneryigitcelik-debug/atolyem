import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin rotaları
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Kullanıcı rolünü kontrol et
    const user = await db.user.findUnique({
      where: { id: token.sub },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // Seller rotaları
  if (pathname.startsWith("/seller")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Kullanıcı rolünü kontrol et
    const user = await db.user.findUnique({
      where: { id: token.sub },
      select: { role: true },
    });

    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*"],
};

