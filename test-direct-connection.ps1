# Direct Connection Test Script

Write-Host "=== Supabase Direct Connection Test ===" -ForegroundColor Cyan
Write-Host ""

# Connection bilgileri
$hostname = "db.tlyuixjkgrpazfezqbxp.supabase.co"
$port = 5432
$user = "postgres.tlyuixjkgrpazfezqbxp"
$password = "gD2YlKbs9dHc7QY5"
$database = "postgres"

# 1. Network bağlantısı testi
Write-Host "1. Network bağlantısı test ediliyor..." -ForegroundColor Yellow
$networkTest = Test-NetConnection -ComputerName $hostname -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($networkTest) {
    Write-Host "   ✅ Network bağlantısı başarılı ($hostname:$port)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Network bağlantısı başarısız ($hostname:$port)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Olası nedenler:" -ForegroundColor Yellow
    Write-Host "   - Supabase projesi paused olabilir" -ForegroundColor Gray
    Write-Host "   - Firewall/IP whitelist sorunu" -ForegroundColor Gray
    Write-Host "   - Network sorunu" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Çözüm:" -ForegroundColor Cyan
    Write-Host "   1. Supabase Dashboard > Projeniz > Settings > General" -ForegroundColor Gray
    Write-Host "   2. Proje durumunu kontrol edin (ACTIVE olmalı)" -ForegroundColor Gray
    Write-Host "   3. Settings > Database > Network restrictions kontrol edin" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# 2. .env dosyası kontrolü
Write-Host "2. .env dosyası kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path .env) {
    $envContent = Get-Content .env
    $hasDirectUrl = $envContent | Select-String -Pattern "^DIRECT_URL"
    
    if ($hasDirectUrl) {
        Write-Host "   ✅ DIRECT_URL bulundu" -ForegroundColor Green
        $directUrlValue = ($hasDirectUrl -split "=")[1] -replace '"', ''
        Write-Host "   Değer: $directUrlValue" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ DIRECT_URL bulunamadı!" -ForegroundColor Red
        Write-Host ""
        Write-Host "   .env dosyasına şu satırı ekleyin:" -ForegroundColor Yellow
        Write-Host "   DIRECT_URL=`"postgresql://$user`:$password@$hostname`:$port/$database`"" -ForegroundColor Green
        exit 1
    }
} else {
    Write-Host "   ❌ .env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Prisma schema kontrolü
Write-Host "3. Prisma schema kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path "prisma\schema.prisma") {
    $schemaContent = Get-Content "prisma\schema.prisma" -Raw
    if ($schemaContent -match "directUrl\s*=\s*env\(`"DIRECT_URL`"\)") {
        Write-Host "   ✅ directUrl schema'da tanımlı" -ForegroundColor Green
    } else {
        Write-Host "   ❌ directUrl schema'da tanımlı değil!" -ForegroundColor Red
        Write-Host ""
        Write-Host "   prisma/schema.prisma dosyasında:" -ForegroundColor Yellow
        Write-Host "   datasource db {" -ForegroundColor Gray
        Write-Host "     provider = `"postgresql`"" -ForegroundColor Gray
        Write-Host "     url      = env(`"DATABASE_URL`")" -ForegroundColor Gray
        Write-Host "     directUrl = env(`"DIRECT_URL`")  // Bu satırı ekleyin" -ForegroundColor Green
        Write-Host "   }" -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host "   ❌ prisma/schema.prisma bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Tüm Kontroller Başarılı! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Prisma Studio'yu başlatabilirsiniz:" -ForegroundColor Cyan
Write-Host "   npx prisma studio" -ForegroundColor Green
Write-Host ""
Write-Host "Eğer hala bağlantı sorunu varsa:" -ForegroundColor Yellow
Write-Host "1. Supabase Dashboard'da projenizin ACTIVE olduğundan emin olun" -ForegroundColor Gray
Write-Host "2. Settings > Database > Network restrictions kontrol edin" -ForegroundColor Gray
Write-Host "3. Bilgisayarınızı yeniden başlatmayı deneyin" -ForegroundColor Gray

