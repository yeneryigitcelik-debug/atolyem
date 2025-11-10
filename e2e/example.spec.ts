import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    
    // Check if page title is correct
    await expect(page).toHaveTitle(/atolyem.net/);
    
    // Check if main heading is visible
    await expect(page.getByRole("heading", { name: /El Yapımı Türk Sanatını Keşfedin/i })).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    
    // Check if navigation is visible
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should display featured products section", async ({ page }) => {
    await page.goto("/");
    
    // Check if featured products section exists
    const featuredSection = page.getByRole("heading", { name: /Öne Çıkan Ürünler/i });
    await expect(featuredSection).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate to pazar page", async ({ page }) => {
    await page.goto("/");
    
    // Find and click pazar link (if exists in navigation)
    const pazarLink = page.getByRole("link", { name: /pazar|Pazar/i }).first();
    if (await pazarLink.isVisible()) {
      await pazarLink.click();
      await expect(page).toHaveURL(/.*pazar.*/);
    }
  });
});

