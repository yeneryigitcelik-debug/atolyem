# Prisma Migration Uygulama Script'i
# Supabase connection string'inizi buraya yapıştırın

Write-Host "=== Prisma Migration Uygulama ===" -ForegroundColor Cyan
Write-Host ""

# Connection string'inizi buraya yapıştırın (password'u değiştirmeyi unutmayın!)
$connectionString = "postgresql://postgres:[YOUR_PASSWORD]@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"

# Password'u değiştirin
if ($connectionString -match "\[YOUR_PASSWORD\]") {
    Write-Host "⚠️  UYARI: Connection string'de [YOUR_PASSWORD] kısmını değiştirmeniz gerekiyor!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Connection string formatı:" -ForegroundColor Gray
    Write-Host "postgresql://postgres:GERÇEK_PAROLANIZ@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres" -ForegroundColor Gray
    Write-Host ""
    $password = Read-Host "Supabase database password'unuzu girin"
    $connectionString = $connectionString -replace "\[YOUR_PASSWORD\]", $password
}

Write-Host "Connection string ayarlanıyor..." -ForegroundColor Green
$env:DATABASE_URL = $connectionString

Write-Host ""
Write-Host "Connection string kontrol ediliyor..." -ForegroundColor Cyan
Write-Host "Host: db.tlyuixjkgrpazfezqbxp.supabase.co:5432" -ForegroundColor Gray
Write-Host ""

Write-Host "Migration durumu kontrol ediliyor..." -ForegroundColor Cyan
# Prisma config'i bypass etmek için direkt schema kullan
$env:DATABASE_URL = $connectionString
npx prisma migrate status --schema=./prisma/schema.prisma

Write-Host ""
Write-Host "Migration'lar uygulanıyor..." -ForegroundColor Cyan
Write-Host "Bu işlem birkaç dakika sürebilir..." -ForegroundColor Gray
Write-Host ""

# Prisma config'i bypass etmek için direkt schema kullan
$env:DATABASE_URL = $connectionString
npx prisma migrate deploy --schema=./prisma/schema.prisma

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
    Write-Host "Hata mesajını kontrol edin ve tekrar deneyin." -ForegroundColor Yellow
}

