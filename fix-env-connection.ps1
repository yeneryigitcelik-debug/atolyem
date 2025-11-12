# .env Connection String Düzeltme Script'i
# Connection pooling hostname'i kullanır

Write-Host "=== .env Connection String Düzeltme ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path .env)) {
    Write-Host "❌ .env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

# Mevcut .env içeriğini oku
$envLines = Get-Content .env
$newLines = @()

# Password'u al
$password = "gD2YlKbs9dHc7QY5"
Write-Host "Password: $password" -ForegroundColor Gray
Write-Host ""

# Doğru connection pooling string'i
$correctUrl = "postgresql://postgres.tlyuixjkgrpazfezqbxp:$password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

Write-Host "Doğru connection pooling string:" -ForegroundColor Green
Write-Host $correctUrl -ForegroundColor Gray
Write-Host ""

# .env dosyasını güncelle
$found = $false
foreach ($line in $envLines) {
    if ($line -match '^DATABASE_URL\s*=') {
        $newLines += "DATABASE_URL=$correctUrl"
        $found = $true
        Write-Host "✅ DATABASE_URL güncellendi" -ForegroundColor Green
    } else {
        $newLines += $line
    }
}

if (-not $found) {
    $newLines += ""
    $newLines += "# Database connection"
    $newLines += "DATABASE_URL=$correctUrl"
    Write-Host "✅ DATABASE_URL eklendi" -ForegroundColor Green
}

# Yedek oluştur
$backupPath = ".env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item .env $backupPath
Write-Host "✅ Yedek oluşturuldu: $backupPath" -ForegroundColor Gray

# Yeni içeriği yaz
$newLines | Set-Content .env -Encoding UTF8

Write-Host ""
Write-Host "✅ .env dosyası güncellendi!" -ForegroundColor Green
Write-Host ""
Write-Host "Test için:" -ForegroundColor Cyan
Write-Host "  npx prisma db pull" -ForegroundColor Gray

