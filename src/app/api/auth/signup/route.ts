/**
 * POST /api/auth/signup - Register new user with username
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db/prisma";
import { signupWithUsernameSchema } from "@/lib/api/validation";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupWithUsernameSchema.parse(body);

    // Normalize username to lowercase
    const normalizedUsername = data.username.toLowerCase();

    // Check if username is already taken (case-insensitive)
    const existingProfile = await prisma.publicProfile.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten alınmış", code: "USERNAME_TAKEN" },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email (no email confirmation needed for now)
      user_metadata: {
        full_name: data.fullName,
        username: normalizedUsername,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten kayıtlı", code: "EMAIL_EXISTS" },
          { status: 409 }
        );
      }
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        { error: "Kayıt işlemi sırasında bir hata oluştu", code: "AUTH_ERROR" },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Kullanıcı oluşturulamadı", code: "USER_CREATION_FAILED" },
        { status: 500 }
      );
    }

    // Create user and public profile in database (transaction)
    await prisma.$transaction(async (tx) => {
      // Create user record
      await tx.user.create({
        data: {
          id: authData.user.id,
          email: data.email,
          displayName: data.fullName,
        },
      });

      // Create public profile with chosen username
      await tx.publicProfile.create({
        data: {
          userId: authData.user.id,
          username: normalizedUsername,
          displayName: data.fullName,
          isPublic: true,
          showFavorites: true,
        },
      });

      // Create buyer profile with defaults
      await tx.buyerProfile.create({
        data: {
          userId: authData.user.id,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.",
        username: normalizedUsername,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Geçersiz veri",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

