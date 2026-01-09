# Ödeme Entegrasyonu ve Kargo Hesaplama Dokümantasyonu

## Yapılan Değişiklikler

### 1. Ödeme Entegrasyonu (Payment Integration)

#### Sorun
Checkout endpoint'inde sipariş oluşturuluyor ve stok düşüyordu ancak ödeme alınmıyordu. Bu durum:
- Stokların boşuna rezerve edilmesine
- Ödeme yapılmadan sipariş oluşturulmasına
- Finansal risklere yol açıyordu

#### Çözüm
1. **Payment Provider Abstraction Layer** (`src/lib/payment/payment-provider.ts`)
   - Iyzico, Stripe gibi farklı ödeme sağlayıcılarını destekleyen abstraction layer
   - Mock provider development için hazır
   - Production'da gerçek provider implementasyonu kolayca eklenebilir

2. **Checkout Flow Refactoring**
   - Checkout'ta sipariş oluşturuluyor ama **stok düşürülmüyor**
   - Payment intent oluşturuluyor
   - Kullanıcıya payment redirect URL veya client secret dönülüyor
   - Stok sadece ödeme başarılı olduktan sonra webhook'ta düşürülüyor

3. **Payment Webhook Handler** (`src/app/api/payment/webhook/route.ts`)
   - Ödeme sağlayıcıdan gelen webhook'ları işler
   - Ödeme başarılı olunca:
     - Sipariş durumu `PAID` olarak güncellenir
     - Stok atomic olarak düşürülür (race condition koruması ile)
   - Ödeme başarısız olunca sipariş durumu güncellenir

4. **Mock Payment Endpoint** (`src/app/api/payment/mock-success/route.ts`)
   - Development/test için mock ödeme başarı endpoint'i
   - Production'da devre dışı

### 2. Kargo Hesaplama (Shipping Calculation)

#### Sorun
- Mock data (0 TL) kullanılıyordu
- ShippingProfile'daki `rulesJson` kullanılmıyordu
- Farklı satıcılardan ürün alındığında kargo hesaplanmıyordu
- Combined shipping mantığı yoktu

#### Çözüm
1. **Shipping Calculation Functions** (`src/application/integrity-rules/pricing-rules.ts`)
   - `calculateShippingForSeller()`: Tek bir satıcı için kargo hesaplar
     - Base price + additional items
     - Free shipping threshold kontrolü
     - Domestic/international shipping desteği
   - `calculateShippingTotal()`: Tüm sepet için kargo hesaplar
     - Ürünleri satıcıya göre gruplar
     - Her satıcı için ayrı kargo hesaplar
     - Toplam kargo ücretini döner

2. **Checkout Integration**
   - Cart items'a shipping profile bilgisi dahil edildi
   - Shipping address'e göre domestic/international belirleniyor
   - Gerçek shipping calculation kullanılıyor

## Kullanım

### Environment Variables

```env
# Payment Provider (mock, iyzico, stripe)
PAYMENT_PROVIDER=mock

# Payment Webhook Secret
PAYMENT_WEBHOOK_SECRET=your-webhook-secret

# App URL for webhooks and redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Checkout Flow

1. **Client**: POST `/api/checkout` ile checkout başlatır
2. **Server**: 
   - Sipariş oluşturur (stok düşürmeden)
   - Payment intent oluşturur
   - Payment redirect URL/client secret döner
3. **Client**: Kullanıcıyı payment sayfasına yönlendirir
4. **Payment Provider**: Ödeme işlemini gerçekleştirir
5. **Payment Provider**: Webhook ile `/api/payment/webhook`'a bildirim gönderir
6. **Server**: 
   - Webhook'u doğrular
   - Ödeme başarılıysa stok düşürür ve sipariş durumunu günceller

### Shipping Profile Yapısı

```typescript
{
  domestic: {
    basePriceMinor: 3000,        // İlk ürün için kargo (30 TL)
    freeAboveMinor: 50000,        // Ücretsiz kargo eşiği (500 TL)
    additionalItemMinor: 1500    // Ek ürün başına kargo (15 TL)
  },
  international?: {
    basePriceMinor: 10000,
    freeAboveMinor: 100000,
    additionalItemMinor: 5000
  }
}
```

### Örnek Senaryolar

#### Senaryo 1: Tek Satıcı, 2 Ürün
- Satıcı A'dan 2 ürün
- Base: 30 TL, Additional: 15 TL
- Toplam Kargo: 30 + 15 = 45 TL

#### Senaryo 2: İki Farklı Satıcı
- Satıcı A'dan 1 ürün: 30 TL
- Satıcı B'dan 1 ürün: 25 TL
- Toplam Kargo: 30 + 25 = 55 TL

#### Senaryo 3: Free Shipping Threshold
- Satıcı A'dan 600 TL değerinde ürün
- Free shipping threshold: 500 TL
- Toplam Kargo: 0 TL

## Production'a Geçiş

### Iyzico Entegrasyonu

1. `src/lib/payment/payment-provider.ts` içinde `IyzicoPaymentProvider` implementasyonu ekleyin
2. Iyzico API credentials'ları environment variables'a ekleyin
3. `PAYMENT_PROVIDER=iyzico` olarak ayarlayın
4. Iyzico webhook URL'ini Iyzico dashboard'da ayarlayın

### Stripe Entegrasyonu

1. `src/lib/payment/payment-provider.ts` içinde `StripePaymentProvider` implementasyonu ekleyin
2. Stripe API keys'leri environment variables'a ekleyin
3. `PAYMENT_PROVIDER=stripe` olarak ayarlayın
4. Stripe webhook endpoint'ini Stripe dashboard'da ayarlayın

## Güvenlik Notları

1. **Webhook Signature Verification**: Tüm webhook'lar signature ile doğrulanmalı
2. **Idempotency**: Aynı ödeme webhook'u birden fazla kez işlenmemeli
3. **Stock Race Conditions**: Stok düşürme işlemleri atomic olarak yapılmalı (WHERE clause kontrolü ile)
4. **Payment Amount Validation**: Webhook'ta ödeme tutarı sipariş tutarı ile karşılaştırılmalı

## Test

### Mock Payment Test

1. Checkout yapın
2. Response'daki `payment.redirectUrl`'e gidin
3. Mock payment success sayfası siparişi tamamlar ve stok düşürür

### Shipping Calculation Test

1. Farklı satıcılardan ürünleri sepete ekleyin
2. Checkout yapın
3. Her satıcı için ayrı kargo ücreti hesaplandığını doğrulayın
4. Combined shipping'in doğru çalıştığını kontrol edin

