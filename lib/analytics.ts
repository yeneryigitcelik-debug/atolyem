import { db } from "@/lib/db";

export interface SalesDataPoint {
  date: string;
  sales: number;
  revenue: number;
}

export interface ProductPerformance {
  productId: string;
  productTitle: string;
  sales: number;
  revenue: number;
  averageRating: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  sales: number;
  revenue: number;
}

/**
 * Get daily sales data for a date range
 */
export async function getDailySales(
  sellerId: string,
  startDate: Date,
  endDate: Date
): Promise<SalesDataPoint[]> {
  // Get seller's variant IDs
  const sellerProducts = await db.product.findMany({
    where: { sellerId },
    select: { id: true },
  });
  const productIds = sellerProducts.map((p) => p.id);

  const sellerVariants = await db.variant.findMany({
    where: { productId: { in: productIds } },
    select: { id: true },
  });
  const variantIds = sellerVariants.map((v) => v.id);

  // Get completed orders in date range
  const orders = await db.order.findMany({
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      items: {
        some: {
          variantId: { in: variantIds },
        },
      },
    },
    include: {
      items: {
        where: {
          variantId: { in: variantIds },
        },
      },
    },
  });

  // Group by date
  const dailyData: Record<string, { sales: number; revenue: number }> = {};

  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = { sales: 0, revenue: 0 };
    }
    dailyData[date].sales += order.items.length;
    dailyData[date].revenue += order.items.reduce(
      (sum, item) => sum + item.priceCents * item.qty,
      0
    );
  });

  // Convert to array and fill missing dates
  const result: SalesDataPoint[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      sales: dailyData[dateStr]?.sales || 0,
      revenue: dailyData[dateStr]?.revenue || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

/**
 * Get monthly sales data
 */
export async function getMonthlySales(
  sellerId: string,
  months: number = 12
): Promise<SalesDataPoint[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get seller metrics
  const metrics = await (db as any).sellerMetrics?.findMany({
    where: {
      sellerId,
      year: { gte: startDate.getFullYear() },
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  const result: SalesDataPoint[] = [];
  const currentDate = new Date(startDate);
  currentDate.setDate(1); // First day of month

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const metric = metrics.find((m: any) => m.year === year && m.month === month);

    result.push({
      date: `${year}-${String(month).padStart(2, "0")}`,
      sales: metric?.totalSales || 0,
      revenue: metric?.totalRevenueCents || 0,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return result;
}

/**
 * Get top performing products
 */
export async function getTopProducts(
  sellerId: string,
  limit: number = 10
): Promise<ProductPerformance[]> {
  const sellerProducts = await db.product.findMany({
    where: { sellerId },
    select: { id: true, title: true },
  });
  const productIds = sellerProducts.map((p) => p.id);

  const sellerVariants = await db.variant.findMany({
    where: { productId: { in: productIds } },
    select: { id: true, productId: true },
  });

  const variantIds = sellerVariants.map((v) => v.id);
  const variantToProduct = new Map(
    sellerVariants.map((v) => [v.id, v.productId])
  );

  // Get order items
  const orderItems = await db.orderItem.findMany({
    where: {
      variantId: { in: variantIds },
      order: {
        status: "COMPLETED",
      },
    },
    include: {
      variant: {
        include: {
          product: {
            select: { title: true },
          },
        },
      },
    },
  });

  // Group by product
  const productData: Record<string, ProductPerformance> = {};

  orderItems.forEach((item) => {
    const productId = variantToProduct.get(item.variantId);
    if (!productId) return;

    if (!productData[productId]) {
      const product = sellerProducts.find((p) => p.id === productId);
      productData[productId] = {
        productId,
        productTitle: product?.title || "Bilinmeyen",
        sales: 0,
        revenue: 0,
        averageRating: 0,
      };
    }

    productData[productId].sales += item.qty;
    productData[productId].revenue += item.priceCents * item.qty;
  });

  // Get average ratings
  const reviews = await db.review.findMany({
    where: { productId: { in: productIds } },
    select: { productId: true, rating: true },
  });

  const ratingByProduct: Record<string, number[]> = {};
  reviews.forEach((review) => {
    if (!ratingByProduct[review.productId]) {
      ratingByProduct[review.productId] = [];
    }
    ratingByProduct[review.productId].push(review.rating);
  });

  Object.keys(productData).forEach((productId) => {
    const ratings = ratingByProduct[productId] || [];
    productData[productId].averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;
  });

  // Sort by revenue and return top N
  return Object.values(productData)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/**
 * Get category performance
 */
export async function getCategoryPerformance(
  sellerId: string
): Promise<CategoryPerformance[]> {
  const sellerProducts = await db.product.findMany({
    where: { sellerId },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  });

  const productIds = sellerProducts.map((p) => p.id);
  const sellerVariants = await db.variant.findMany({
    where: { productId: { in: productIds } },
    select: { id: true, productId: true },
  });

  const variantIds = sellerVariants.map((v) => v.id);
  const productToCategory = new Map(
    sellerProducts.map((p) => [p.id, p.category])
  );

  const orderItems = await db.orderItem.findMany({
    where: {
      variantId: { in: variantIds },
      order: {
        status: "COMPLETED",
      },
    },
    include: {
      variant: {
        select: { productId: true },
      },
    },
  });

  const categoryData: Record<string, CategoryPerformance> = {};

  orderItems.forEach((item) => {
    const category = productToCategory.get(item.variant.productId);
    if (!category) return;

    if (!categoryData[category.id]) {
      categoryData[category.id] = {
        categoryId: category.id,
        categoryName: category.name,
        sales: 0,
        revenue: 0,
      };
    }

    categoryData[category.id].sales += item.qty;
    categoryData[category.id].revenue += item.priceCents * item.qty;
  });

  return Object.values(categoryData).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Get summary statistics
 */
export async function getSellerSummary(sellerId: string) {
  const sellerProducts = await db.product.findMany({
    where: { sellerId },
    select: { id: true },
  });
  const productIds = sellerProducts.map((p) => p.id);

  const sellerVariants = await db.variant.findMany({
    where: { productId: { in: productIds } },
    select: { id: true },
  });
  const variantIds = sellerVariants.map((v) => v.id);

  // Get current month metrics
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMetric = await (db as any).sellerMetrics?.findUnique({
    where: {
      sellerId_month_year: {
        sellerId,
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  // Get last month for comparison
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const lastMetric = await (db as any).sellerMetrics?.findUnique({
    where: {
      sellerId_month_year: {
        sellerId,
        month: lastMonth,
        year: lastYear,
      },
    },
  });

  // Get total stats
  const totalOrders = await db.order.count({
    where: {
      status: "COMPLETED",
      items: {
        some: {
          variantId: { in: variantIds },
        },
      },
    },
  });

  const totalRevenue = await db.orderItem.aggregate({
    where: {
      variantId: { in: variantIds },
      order: {
        status: "COMPLETED",
      },
    },
    _sum: {
      priceCents: true,
    },
  });

  return {
    currentMonth: {
      sales: currentMetric?.totalSales || 0,
      revenue: currentMetric?.totalRevenueCents || 0,
      completedOrders: currentMetric?.completedOrders || 0,
      averageOrderValue: currentMetric?.averageOrderValueCents || 0,
    },
    lastMonth: {
      sales: lastMetric?.totalSales || 0,
      revenue: lastMetric?.totalRevenueCents || 0,
      completedOrders: lastMetric?.completedOrders || 0,
      averageOrderValue: lastMetric?.averageOrderValueCents || 0,
    },
    total: {
      orders: totalOrders,
      revenue: totalRevenue._sum.priceCents || 0,
    },
  };
}

