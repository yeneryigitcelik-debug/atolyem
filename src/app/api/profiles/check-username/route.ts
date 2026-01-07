/**
 * GET /api/profiles/check-username - Check if username is available
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  // Validate username format
  const usernameRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!usernameRegex.test(username) || username.length < 3 || username.length > 50) {
    return NextResponse.json({ 
      available: false, 
      reason: "invalid_format" 
    });
  }

  // Check reserved usernames
  const reservedUsernames = [
    "admin", "administrator", "root", "system", "atolyem", "support", "help",
    "api", "app", "www", "mail", "email", "ftp", "blog", "shop", "store",
    "sanatci", "sanatcilar", "sanatsever", "hesap", "ayarlar", "profil",
    "siparislerim", "favorilerim", "mesajlar", "sepet", "kesfet",
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return NextResponse.json({ 
      available: false, 
      reason: "reserved" 
    });
  }

  // Check database
  const existingProfile = await prisma.publicProfile.findUnique({
    where: { username },
    select: { username: true },
  });

  return NextResponse.json({ 
    available: !existingProfile,
    reason: existingProfile ? "taken" : null,
  });
}

