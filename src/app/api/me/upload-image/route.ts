/**
 * POST /api/me/upload-image - Upload profile/banner image
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AppError, ErrorCodes } from "@/lib/api/errors";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BANNER_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user } = await requireAuth();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "No file provided", 400);
  }

  if (!type || !["avatar", "banner"].includes(type)) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "Invalid image type. Must be 'avatar' or 'banner'", 400);
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      400
    );
  }

  // Validate file size
  const maxSize = type === "avatar" ? MAX_AVATAR_SIZE : MAX_BANNER_SIZE;
  if (file.size > maxSize) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
      400
    );
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const filename = `${user.id}/${type}-${timestamp}.${ext}`;
  const bucket = "profile-images";

  // Upload to Supabase Storage
  const supabase = createSupabaseAdminClient();
  
  const buffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    logger.error("Failed to upload image to Supabase Storage", new Error(error.message), { filename });
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to upload image", 500);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  logger.info("Image uploaded successfully", { 
    userId: user.id, 
    type, 
    path: data.path 
  });

  return NextResponse.json(
    { 
      url: urlData.publicUrl,
      path: data.path,
    },
    { headers: { "x-request-id": requestId } }
  );
});

