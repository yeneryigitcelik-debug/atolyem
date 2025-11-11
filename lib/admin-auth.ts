// Admin için ayrı authentication sistemi (NextAuth'tan bağımsız)
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || "admin-secret-key");

export interface AdminSession extends JWTPayload {
  id: string;
  email: string;
  name: string | null;
}

// Admin giriş yap
export async function adminLogin(email: string, password: string) {
  // Sadece ADMIN rolündeki kullanıcılar giriş yapabilir
  const user = await db.user.findUnique({
    where: { email, role: "ADMIN" },
  });

  if (!user || !user.hashedPw) {
    return { error: "Email veya şifre hatalı" };
  }

  const isValid = await bcrypt.compare(password, user.hashedPw);
  if (!isValid) {
    return { error: "Email veya şifre hatalı" };
  }

  // JWT token oluştur
  const session: AdminSession = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);

  // Cookie'ye kaydet
  const cookieStore = await cookies();
  cookieStore.set("admin-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 saat
    path: "/",
  });

  return { success: true };
}

// Admin oturumunu kontrol et
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-session")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET);
    const session = payload as AdminSession;

    // Kullanıcının hala ADMIN rolünde olduğunu kontrol et
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Admin çıkış yap
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-session");
}

