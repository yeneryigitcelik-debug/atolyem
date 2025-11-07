import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

/**
 * Order Service - Handles cart and order state machine transitions
 * All operations are transactional to ensure data consistency
 */

export class OrderError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "OrderError";
  }
}

/**
 * Adds an item to the user's cart
 * Creates a new CART order if one doesn't exist
 */
export async function addToCart(
  userId: string,
  variantId: string,
  qty: number
): Promise<{ orderId: string; itemId: string }> {
  if (qty <= 0) {
    throw new OrderError("Miktar 0'dan büyük olmalıdır", "INVALID_QTY");
  }

  return await db.$transaction(async (tx) => {
    // Get variant with stock check
    const variant = await tx.variant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new OrderError("Varyant bulunamadı", "VARIANT_NOT_FOUND");
    }

    if (!variant.product.isActive) {
      throw new OrderError("Ürün aktif değil", "PRODUCT_INACTIVE");
    }

    if (variant.stock < qty) {
      throw new OrderError(`Stok yetersiz. Mevcut stok: ${variant.stock}`, "INSUFFICIENT_STOCK");
    }

    // Find or create CART order
    let order = await tx.order.findFirst({
      where: { userId, status: "CART" },
      include: { items: true },
    });

    if (!order) {
      order = await tx.order.create({
        data: {
          userId,
          status: "CART",
          totalCents: 0,
        },
        include: { items: true },
      });
    }

    // Check if item already exists in cart
    const existingItem = order.items.find((item) => item.variantId === variantId);

    if (existingItem) {
      // Update quantity
      const newQty = existingItem.qty + qty;
      if (variant.stock < newQty) {
        throw new OrderError(
          `Stok yetersiz. Mevcut stok: ${variant.stock}, sepette: ${existingItem.qty}`,
          "INSUFFICIENT_STOCK"
        );
      }

      const updatedItem = await tx.orderItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty, priceCents: variant.priceCents },
      });

      // Recalculate total
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

      await tx.order.update({
        where: { id: order.id },
        data: { totalCents },
      });

      return { orderId: order.id, itemId: updatedItem.id };
    } else {
      // Create new item
      const item = await tx.orderItem.create({
        data: {
          orderId: order.id,
          variantId,
          qty,
          priceCents: variant.priceCents,
        },
      });

      // Recalculate total
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

      await tx.order.update({
        where: { id: order.id },
        data: { totalCents },
      });

      return { orderId: order.id, itemId: item.id };
    }
  });
}

/**
 * Places an order (CART → PENDING)
 * Validates stock, creates order, and reduces stock
 */
export async function placeOrder(
  userId: string,
  addressId: string
): Promise<{ orderId: string }> {
  return await db.$transaction(async (tx) => {
    // Get cart order
    const order = await tx.order.findFirst({
      where: { userId, status: "CART" },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new OrderError("Sepet bulunamadı", "CART_NOT_FOUND");
    }

    if (order.items.length === 0) {
      throw new OrderError("Sepet boş", "EMPTY_CART");
    }

    // Verify address
    const address = await tx.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new OrderError("Adres bulunamadı", "ADDRESS_NOT_FOUND");
    }

    // Validate stock and reduce it
    for (const item of order.items) {
      if (item.variant.stock < item.qty) {
        throw new OrderError(
          `Stok yetersiz: ${item.variant.product.title} (${item.variant.sku})`,
          "INSUFFICIENT_STOCK"
        );
      }

      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.qty } },
      });
    }

    // Update order status to PENDING
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PENDING",
        addressId,
      },
    });

    return { orderId: updatedOrder.id };
  });
}

/**
 * Marks an order as paid (PENDING → PAID)
 * Idempotent: can be called multiple times safely
 */
export async function markPaid(
  orderId: string,
  paymentData: {
    gateway: "IYZICO" | "PAYTR";
    txnId: string;
    amountCents: number;
    rawPayload?: any;
  }
): Promise<void> {
  return await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new OrderError("Sipariş bulunamadı", "ORDER_NOT_FOUND");
    }

    if (order.status === "PAID") {
      // Already paid, check if payment record exists
      const existingPayment = await tx.payment.findFirst({
        where: { orderId, txnId: paymentData.txnId },
      });

      if (existingPayment) {
        // Idempotent: already processed
        return;
      }
    }

    if (order.status !== "PENDING") {
      throw new OrderError(
        `Sipariş ödeme için uygun durumda değil. Mevcut durum: ${order.status}`,
        "INVALID_STATUS"
      );
    }

    // Create payment record
    await tx.payment.create({
      data: {
        orderId,
        gateway: paymentData.gateway,
        txnId: paymentData.txnId,
        status: "COMPLETED",
        amountCents: paymentData.amountCents,
        rawPayload: paymentData.rawPayload || null,
      },
    });

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });
  });
}

/**
 * Creates a shipment for an order (PAID → SHIPPED)
 */
export async function ship(
  orderId: string,
  tracking: {
    carrier: string;
    trackingCode: string;
  }
): Promise<{ shipmentId: string }> {
  return await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new OrderError("Sipariş bulunamadı", "ORDER_NOT_FOUND");
    }

    if (order.status !== "PAID") {
      throw new OrderError(
        `Sipariş kargo için uygun durumda değil. Mevcut durum: ${order.status}`,
        "INVALID_STATUS"
      );
    }

    // Create shipment
    const shipment = await tx.shipment.create({
      data: {
        orderId,
        carrier: tracking.carrier,
        trackingCode: tracking.trackingCode,
        status: "CREATED",
      },
    });

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: "SHIPPED" },
    });

    return { shipmentId: shipment.id };
  });
}

/**
 * Marks an order as completed (SHIPPED → COMPLETED)
 */
export async function complete(orderId: string): Promise<void> {
  return await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new OrderError("Sipariş bulunamadı", "ORDER_NOT_FOUND");
    }

    if (order.status !== "SHIPPED") {
      throw new OrderError(
        `Sipariş tamamlanma için uygun durumda değil. Mevcut durum: ${order.status}`,
        "INVALID_STATUS"
      );
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });
  });
}

/**
 * Gets the user's current cart
 */
export async function getCart(userId: string) {
  return await db.order.findFirst({
    where: { userId, status: "CART" },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sort: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Removes an item from cart
 */
export async function removeFromCart(userId: string, itemId: string): Promise<void> {
  return await db.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { userId, status: "CART" },
      include: { items: true },
    });

    if (!order) {
      throw new OrderError("Sepet bulunamadı", "CART_NOT_FOUND");
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new OrderError("Sepet öğesi bulunamadı", "ITEM_NOT_FOUND");
    }

    await tx.orderItem.delete({
      where: { id: itemId },
    });

    // Recalculate total
    const remainingItems = await tx.orderItem.findMany({ where: { orderId: order.id } });
    const totalCents = remainingItems.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

    await tx.order.update({
      where: { id: order.id },
      data: { totalCents },
    });
  });
}

/**
 * Updates item quantity in cart
 */
export async function updateCartItem(
  userId: string,
  itemId: string,
  qty: number
): Promise<void> {
  if (qty <= 0) {
    throw new OrderError("Miktar 0'dan büyük olmalıdır", "INVALID_QTY");
  }

  return await db.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { userId, status: "CART" },
      include: { items: { include: { variant: true } } },
    });

    if (!order) {
      throw new OrderError("Sepet bulunamadı", "CART_NOT_FOUND");
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new OrderError("Sepet öğesi bulunamadı", "ITEM_NOT_FOUND");
    }

    if (item.variant.stock < qty) {
      throw new OrderError(`Stok yetersiz. Mevcut stok: ${item.variant.stock}`, "INSUFFICIENT_STOCK");
    }

    await tx.orderItem.update({
      where: { id: itemId },
      data: { qty },
    });

    // Recalculate total
    const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

    await tx.order.update({
      where: { id: order.id },
      data: { totalCents },
    });
  });
}

