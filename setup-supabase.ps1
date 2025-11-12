# Supabase CLI ile Proje Kurulum Script'i

Write-Host "=== Supabase CLI ile Proje Kurulumu ===" -ForegroundColor Cyan
Write-Host ""

# 1. Login kontrolü
Write-Host "1. Supabase login kontrol ediliyor..." -ForegroundColor Yellow
$loginCheck = npx supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Login yapmanız gerekiyor!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Supabase Dashboard'dan access token alın:" -ForegroundColor Gray
    Write-Host "   - Account Settings > Access Tokens > Create new token" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Sonra şu komutu çalıştırın:" -ForegroundColor Cyan
    Write-Host "   npx supabase login" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Login yaptınız mı? (y/n)"
    
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Lütfen önce login yapın!" -ForegroundColor Red
        exit 1
    }
}

# 2. Projeyi link et
Write-Host ""
Write-Host "2. Proje link ediliyor..." -ForegroundColor Yellow
Write-Host "   Project ref: tlyuixjkgrpazfezqbxp" -ForegroundColor Gray

npx supabase link --project-ref tlyuixjkgrpazfezqbxp

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Proje başarıyla link edildi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Connection string otomatik olarak .env dosyasına eklendi." -ForegroundColor Gray
} else {
    Write-Host "   ❌ Proje link edilemedi!" -ForegroundColor Red
    Write-Host "   Hata mesajını kontrol edin." -ForegroundColor Yellow
    exit 1
}

# 3. Migration'ları uygula
Write-Host ""
Write-Host "3. Migration'lar uygulanıyor..." -ForegroundColor Yellow

npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration'lar başarıyla uygulandı!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sonraki adımlar:" -ForegroundColor Cyan
    Write-Host "1. Supabase Dashboard > Table Editor'da tabloları kontrol edin" -ForegroundColor Gray
    Write-Host "2. Vercel'de DATABASE_URL environment variable'ını ekleyin" -ForegroundColor Gray
    Write-Host "3. Vercel'de redeploy yapın" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Migration hatası oluştu!" -ForegroundColor Red
    Write-Host "Hata mesajını kontrol edin." -ForegroundColor Yellow
}

