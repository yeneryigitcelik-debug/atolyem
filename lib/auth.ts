// lib/auth.ts — NextAuth ayarları (Credentials + PrismaAdapter)
import { PrismaAdapter } from "@auth/prisma-adapter"; // NextAuth↔Prisma köprüsü
import type { NextAuthOptions } from "next-auth";     // Tipler
import Credentials from "next-auth/providers/credentials"; // Email+şifre provider
import { db } from "@/lib/db";                        // Prisma client'ımız
import bcrypt from "bcrypt";                          // Şifre karşılaştırma

// NEXTAUTH_SECRET kontrolü
if (!process.env.NEXTAUTH_SECRET) {
  console.error("⚠️ NEXTAUTH_SECRET environment variable is missing!");
  console.error("⚠️ Authentication will fail. Please set NEXTAUTH_SECRET in Vercel environment variables.");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,                  // Session/Account tablolarını kullan
  session: { strategy: "jwt" },                       // JWT strategy (Credentials ile uyumlu)
  secret: process.env.NEXTAUTH_SECRET,                 // Secret key (JWT imzalama için)
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {                                  // Form alanları
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {                  // Giriş doğrulama
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } }); // Kullanıcıyı bul
        if (!user || !user.hashedPw) return null;    // Kayıt yoksa/şifre alanı yoksa
        const ok = await bcrypt.compare(credentials.password, user.hashedPw); // Şifreyi doğrula
        return ok ? user : null;                      // Doğruysa user, değilse null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id; // Middleware'de token.sub kullanılıyor
        token.role = (user as any).role; // Role'ü token'a ekle
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role; // Role'ü session'a ekle
      }
      return session;
    },
  },
};

