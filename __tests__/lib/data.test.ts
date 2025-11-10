import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCategories, getActiveProducts } from "@/lib/data";

// Mock Prisma client
vi.mock("@/lib/db", () => ({
  db: {
    category: {
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe("lib/data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategories", () => {
    it("should return categories from database", async () => {
      const mockCategories = [
        {
          id: "1",
          name: "Seramik",
          slug: "seramik",
          parentId: null,
          children: [],
        },
      ];

      const { db } = await import("@/lib/db");
      vi.mocked(db.category.findMany).mockResolvedValue(mockCategories as any);

      const categories = await getCategories();

      expect(categories).toEqual(mockCategories);
      expect(db.category.findMany).toHaveBeenCalledWith({
        where: { parentId: null },
        include: {
          children: {
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("getActiveProducts", () => {
    it("should return active products with minimal fields", async () => {
      const mockProducts = [
        {
          id: "1",
          title: "Test Product",
          slug: "test-product",
          isActive: true,
          createdAt: new Date(),
          images: [{ url: "/test.jpg", alt: "Test" }],
          category: { id: "1", name: "Test", slug: "test" },
          seller: {
            id: "1",
            displayName: "Test Seller",
            user: { name: "Test User", email: "test@example.com" },
          },
          variants: [{ priceCents: 10000, stock: 10 }],
        },
      ];

      const { db } = await import("@/lib/db");
      vi.mocked(db.product.findMany).mockResolvedValue(mockProducts as any);

      const products = await getActiveProducts({ limit: 10 });

      expect(products).toEqual(mockProducts);
      expect(db.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          select: expect.any(Object),
        })
      );
    });

    it("should filter by category when categoryId is provided", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.product.findMany).mockResolvedValue([]);

      await getActiveProducts({ categoryId: "cat-1" });

      expect(db.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, categoryId: "cat-1" },
        })
      );
    });
  });
});

