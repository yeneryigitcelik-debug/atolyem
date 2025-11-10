# Özellik Durumu

Bu dosya, Prisma şemasında tanımlı özelliklerin UI implementasyon durumunu gösterir.

## ✅ Tamamen Aktif Özellikler

- ✅ **Kullanıcı Yönetimi** - Giriş, kayıt, profil
- ✅ **Ürün Yönetimi** - Ürün listeleme, detay, arama
- ✅ **Kategori Sistemi** - Kategori menüsü, filtreleme
- ✅ **Sepet** - Sepete ekleme, güncelleme, silme
- ✅ **Sipariş** - Sipariş oluşturma, listeleme
- ✅ **Ödeme** - Ödeme gateway entegrasyonu (Iyzico, PayTR)
- ✅ **Mesajlaşma** - Ürün ve sipariş konuşmaları
- ✅ **Satıcı Paneli** - Satıcı dashboard, ürün yönetimi

## 🚧 Kısmen Aktif Özellikler

- ✅ **Favoriler** - DB entegrasyonu tamamlandı, ürün detay sayfasında favori ekleme butonu eklendi
- ✅ **Kargo Takibi** - Sipariş sayfasında kargo bilgisi ve tracking linki gösteriliyor
- 🚧 **Ödeme Detayları** - API'de var, UI'da detay gösterimi yok

## ❌ Şemada Tanımlı Ancak UI'da Olmayan Özellikler

- ❌ **Ürün Yorumları (Review)** - Model var, UI yok (orders sayfasında placeholder var)
- ❌ **Satıcı Yorumları (SellerReview)** - Model var, UI yok
- ❌ **Kupon Sistemi (Coupon)** - Model var, UI yok (checkout sayfasına eklenecek)
- ✅ **Favori Satıcılar** - Model var, favoriler sayfasında gösteriliyor

## 📋 Öncelikli Geliştirme Planı

### Yüksek Öncelik
1. ✅ **Favoriler Sistemi** - Tamamlandı
2. ✅ **Kargo Takibi** - Temel tracking bilgisi eklendi
3. **Ürün Yorumları** - Temel review sistemi (orders sayfasında placeholder var)

### Orta Öncelik
4. **Kupon Sistemi** - Kupon girişi ve uygulama
5. **Satıcı Yorumları** - Satıcı değerlendirme sistemi

### Düşük Öncelik
6. **Favori Satıcılar** - Satıcı favorileme özelliği

## Notlar

- Tüm modeller Prisma şemasında tanımlı ve migration'lar yapılmış
- API endpoint'leri bazı özellikler için mevcut (mesajlaşma, ödeme)
- UI implementasyonu önceliklendirilmiş şekilde yapılacak

