/**
 * POST /api/auth/confirm-email - Confirm user email (bypass email confirmation)
 * This is a temporary solution to bypass email confirmation requirement
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use admin client to confirm email
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (error) {
      console.error("Email confirmation error:", error);
      return NextResponse.json(
        { error: "Email confirmation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Email confirmed successfully",
      user: data.user,
    });
  } catch (error) {
    console.error("Confirm email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



