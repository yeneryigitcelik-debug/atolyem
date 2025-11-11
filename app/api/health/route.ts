import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Database bağlantısını test et
    await db.$queryRaw`SELECT 1`;
    
    // Basit bir query test et
    const categoryCount = await db.category.count();
    
    return NextResponse.json({
      status: "ok",
      database: "connected",
      categoryCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

