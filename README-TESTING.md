# Testing Guide

Bu proje için test altyapısı ve kalite kontrol süreçleri.

## Test Türleri

### Unit Tests (Vitest)
- **Konum**: `__tests__/` ve `**/*.test.{ts,tsx}`
- **Çalıştırma**: `npm run test:unit`
- **Watch Mode**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`
- **UI Mode**: `npm run test:ui`

### E2E Tests (Playwright)
- **Konum**: `e2e/`
- **Çalıştırma**: `npm run test:e2e`
- **UI Mode**: `npm run test:e2e:ui`
- **Headed Mode**: `npm run test:e2e:headed`

## Kalite Kontrol Komutları

### Hızlı Kontrol
```bash
npm run quality
```
Şunları çalıştırır:
- Type check (`tsc --noEmit`)
- Lint (`eslint`)
- Format check (`prettier --check`)
- Unit tests

### Otomatik Düzeltme
```bash
npm run quality:fix
```
Şunları düzeltir:
- Lint hataları (`eslint --fix`)
- Format sorunları (`prettier --write`)

### Tam Kontrol (CI için)
```bash
npm run quality:full
```
Tüm kalite kontrolleri + E2E testler + Build kontrolü

## CI/CD

### GitHub Actions Workflows

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Her push ve PR'da çalışır
   - Quality checks
   - E2E tests
   - Build check

2. **PR Workflow** (`.github/workflows/pr.yml`)
   - PR'larda çalışır
   - Quality checks
   - PR yorumu ekler (başarısız olursa)

## Test Yazma

### Unit Test Örneği
```typescript
import { describe, it, expect } from "vitest";

describe("MyComponent", () => {
  it("should render correctly", () => {
    expect(true).toBe(true);
  });
});
```

### E2E Test Örneği
```typescript
import { test, expect } from "@playwright/test";

test("should load homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/atolyem.net/);
});
```

## Coverage

Coverage raporu oluşturmak için:
```bash
npm run test:coverage
```

Rapor `coverage/` klasöründe oluşturulur.

## Best Practices

1. **Unit Tests**: Hızlı, izole, deterministik
2. **E2E Tests**: Kritik user flow'ları test et
3. **Coverage**: Minimum %70 hedefle
4. **CI**: Her PR'da tüm testler çalışmalı
5. **Mocking**: External dependencies için mock kullan
