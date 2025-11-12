# Supabase Connection Test Script

Write-Host "=== Supabase Connection Test ===" -ForegroundColor Cyan
Write-Host ""

# Connection string'i al
$password = Read-Host "Supabase database password'unuzu girin"
$connectionString = "postgresql://postgres:$password@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"

Write-Host ""
Write-Host "Connection string test ediliyor..." -ForegroundColor Yellow
Write-Host "Host: db.tlyuixjkgrpazfezqbxp.supabase.co:5432" -ForegroundColor Gray
Write-Host ""

# Environment variable'ı ayarla
$env:DATABASE_URL = $connectionString

# Test 1: Prisma ile bağlantı testi
Write-Host "1. Prisma bağlantı testi..." -ForegroundColor Cyan
try {
    npx prisma db execute --stdin --schema=./prisma/schema.prisma 2>&1 | Out-Null
    Write-Host "   Prisma komutu çalıştırıldı" -ForegroundColor Gray
} catch {
    Write-Host "   Prisma komutu hatası: $_" -ForegroundColor Yellow
}

# Test 2: Basit SQL sorgusu
Write-Host ""
Write-Host "2. SQL bağlantı testi..." -ForegroundColor Cyan
$testQuery = "SELECT 1 as test;"
$testQuery | npx prisma db execute --stdin --schema=./prisma/schema.prisma 2>&1

# Test 3: psql ile test (eğer yüklüyse)
Write-Host ""
Write-Host "3. psql bağlantı testi (opsiyonel)..." -ForegroundColor Cyan
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlPath) {
    Write-Host "   psql bulundu, test ediliyor..." -ForegroundColor Gray
    # psql test komutu
} else {
    Write-Host "   psql bulunamadı (opsiyonel)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Test Tamamlandı ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Eğer hata alıyorsanız:" -ForegroundColor Yellow
Write-Host "1. Supabase Dashboard > Settings > Database'den connection string'i tekrar kontrol edin" -ForegroundColor Gray
Write-Host "2. Password'un doğru olduğundan emin olun" -ForegroundColor Gray
Write-Host "3. Supabase projenizin aktif olduğundan emin olun (pause edilmiş olabilir)" -ForegroundColor Gray
Write-Host "4. Connection pooling kullanmayı deneyin (port 6543)" -ForegroundColor Gray

