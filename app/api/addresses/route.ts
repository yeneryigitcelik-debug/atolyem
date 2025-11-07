import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema } from "@/lib/validators";

/**
 * GET /api/addresses - Get user's addresses
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/addresses - Create a new address
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json({ error: firstError?.message || "Invalid data" }, { status: 400 });
    }

    const data = validation.data;

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        title: data.title,
        city: data.city,
        district: data.district,
        addressLine: data.addressLine,
        phone: data.phone || null,
        isDefault: data.isDefault,
      },
    });

    return NextResponse.json({ address });
  } catch (error: any) {
    console.error("Addresses POST error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/addresses - Update an address
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const validation = addressSchema.partial().safeParse(updateData);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json({ error: firstError?.message || "Invalid data" }, { status: 400 });
    }

    const data = validation.data;

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await db.address.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.city && { city: data.city }),
        ...(data.district && { district: data.district }),
        ...(data.addressLine && { addressLine: data.addressLine }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    return NextResponse.json({ address });
  } catch (error: any) {
    console.error("Addresses PATCH error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/addresses - Delete an address
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await db.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Addresses DELETE error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
