# Database Connection String Düzeltme Script'i

Write-Host "=== Database Connection String Düzeltme ===" -ForegroundColor Cyan
Write-Host ""

# Connection pooling bilgileri
$poolerHost = "aws-1-ap-southeast-1.pooler.supabase.com"
$poolerPort = 6543
$dbUser = "postgres.tlyuixjkgrpazfezqbxp"
$dbPassword = "gD2YlKbs9dHc7QY5"
$dbName = "postgres"

# Connection pooling string (doğru format)
$correctConnectionString = "postgresql://${dbUser}:${dbPassword}@${poolerHost}:${poolerPort}/${dbName}?pgbouncer=true"

Write-Host "✅ Doğru Connection String:" -ForegroundColor Green
Write-Host $correctConnectionString -ForegroundColor Gray
Write-Host ""

# .env dosyasını kontrol et
if (Test-Path .env) {
    Write-Host "📝 .env dosyası bulundu" -ForegroundColor Yellow
    
    # Mevcut DATABASE_URL'i kontrol et
    $envContent = Get-Content .env
    $hasDatabaseUrl = $envContent | Select-String -Pattern "^DATABASE_URL"
    
    if ($hasDatabaseUrl) {
        Write-Host "⚠️  Mevcut DATABASE_URL bulundu:" -ForegroundColor Yellow
        $hasDatabaseUrl | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        Write-Host ""
        Write-Host "Yukarıdaki doğru connection string'i .env dosyasına ekleyin:" -ForegroundColor Cyan
        Write-Host "DATABASE_URL=`"$correctConnectionString`"" -ForegroundColor Green
    } else {
        Write-Host "❌ DATABASE_URL bulunamadı" -ForegroundColor Red
        Write-Host ""
        Write-Host ".env dosyasına şu satırı ekleyin:" -ForegroundColor Cyan
        Write-Host "DATABASE_URL=`"$correctConnectionString`"" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env dosyası bulunamadı" -ForegroundColor Red
    Write-Host ""
    Write-Host ".env dosyası oluşturun ve şu satırı ekleyin:" -ForegroundColor Cyan
    Write-Host "DATABASE_URL=`"$correctConnectionString`"" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Connection Test ===" -ForegroundColor Cyan
$test = Test-NetConnection -ComputerName $poolerHost -Port $poolerPort -InformationLevel Quiet -WarningAction SilentlyContinue
if ($test) {
    Write-Host "✅ Connection pooling erişilebilir! ($poolerHost:$poolerPort)" -ForegroundColor Green
} else {
    Write-Host "❌ Connection pooling erişilemiyor ($poolerHost:$poolerPort)" -ForegroundColor Red
    Write-Host "   Firewall veya network sorunu olabilir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚠️  ÖNEMLİ:" -ForegroundColor Yellow
Write-Host "   - Connection pooling string kullanın (port 6543)" -ForegroundColor Gray
Write-Host "   - Direct connection string kullanmayın (port 5432)" -ForegroundColor Gray
Write-Host "   - Prisma migrations için connection pooling yeterli" -ForegroundColor Gray

