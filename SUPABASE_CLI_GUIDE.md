# Supabase CLI Kullanım Rehberi

## 📦 Supabase CLI Kurulumu

### Yöntem 1: npm ile (Önerilen)

```powershell
npm install -g supabase
```

### Yöntem 2: npx ile (Kurulum gerektirmez)

```powershell
npx supabase --version
```

## 🔐 Supabase CLI ile Login

1. **Supabase Dashboard**'dan access token alın:
   - Supabase Dashboard > Account Settings > Access Tokens
   - Yeni token oluşturun

2. **CLI ile login yapın:**
```powershell
npx supabase login
```

Token'ı yapıştırın.

## 🔗 Projeyi Link Etme

```powershell
npx supabase link --project-ref tlyuixjkgrpazfezqbxp
```

Bu komut:
- ✅ Projenizi lokal klasörle link eder
- ✅ Connection string'i otomatik ayarlar
- ✅ `.env` dosyasını günceller

## 🚀 Migration'ları Uygulama

Supabase CLI ile migration'ları uygulamak çok kolay:

```powershell
# Migration'ları Supabase'e push et
npx supabase db push
```

Veya Prisma migration'larını kullanarak:

```powershell
# Önce Prisma migration'larını uygula
npx prisma migrate deploy
```

## 📋 Diğer Yararlı Komutlar

### Database Schema'yı Görüntüleme
```powershell
npx supabase db diff
```

### Migration Oluşturma
```powershell
npx supabase migration new migration_name
```

### Database Reset
```powershell
npx supabase db reset
```

### Connection String'i Görüntüleme
```powershell
npx supabase status
```

## ✅ Supabase CLI ile Migration Uygulama Adımları

1. **Login yapın:**
```powershell
npx supabase login
```

2. **Projeyi link edin:**
```powershell
npx supabase link --project-ref tlyuixjkgrpazfezqbxp
```

3. **Migration'ları uygulayın:**
```powershell
# Prisma migration'larını kullan
npx prisma migrate deploy

# Veya Supabase migration'larını kullan
npx supabase db push
```

## 🎯 Avantajları

- ✅ Connection string'i otomatik ayarlar
- ✅ Proje ayarlarını otomatik yükler
- ✅ Migration'ları kolayca uygular
- ✅ Database schema'yı görüntüleyebilirsiniz

