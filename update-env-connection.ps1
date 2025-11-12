# .env Connection String Güncelleme Script'i

Write-Host "=== .env Connection String Güncelleme ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path .env)) {
    Write-Host "❌ .env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

# Mevcut DATABASE_URL'i oku
$envContent = Get-Content .env -Raw
$envLines = Get-Content .env

# Mevcut connection string'i göster
$currentLine = $envLines | Where-Object { $_ -match '^DATABASE_URL' }
if ($currentLine) {
    Write-Host "Mevcut DATABASE_URL:" -ForegroundColor Yellow
    Write-Host $currentLine -ForegroundColor Gray
    Write-Host ""
}

# Password'u çıkar
$password = ""
if ($currentLine -match "postgresql://postgres[.:]([^@]+)@") {
    $password = $matches[1]
    Write-Host "Password bulundu" -ForegroundColor Green
} else {
    Write-Host "⚠️  Password bulunamadı, manuel girmeniz gerekecek" -ForegroundColor Yellow
    $password = Read-Host "Supabase database password'unuzu girin"
}

Write-Host ""
Write-Host "Connection pooling string'i oluşturuluyor..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Region bilgisini girin (örn: eu-central-1, us-east-1, ap-southeast-1)" -ForegroundColor Yellow
Write-Host "Supabase Dashboard > Settings > Database'den region'ı görebilirsiniz" -ForegroundColor Gray
$region = Read-Host "Region"

if (-not $region) {
    Write-Host "❌ Region girilmedi!" -ForegroundColor Red
    exit 1
}

# Connection pooling string'i oluştur
$poolingUrl = "postgresql://postgres.tlyuixjkgrpazfezqbxp:$password@aws-0-$region.pooler.supabase.com:6543/postgres?pgbouncer=true"

Write-Host ""
Write-Host "Yeni connection pooling string:" -ForegroundColor Green
Write-Host $poolingUrl -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host ".env dosyasını güncellemek ister misiniz? (y/n)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    # .env dosyasını güncelle
    $newLines = $envLines | ForEach-Object {
        if ($_ -match '^DATABASE_URL') {
            "DATABASE_URL=`"$poolingUrl`""
        } else {
            $_
        }
    }
    
    Set-Content -Path .env -Value $newLines
    Write-Host ""
    Write-Host "✅ .env dosyası güncellendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Şimdi test edin:" -ForegroundColor Cyan
    Write-Host "npx prisma migrate status" -ForegroundColor Yellow
} else {
    Write-Host "İptal edildi." -ForegroundColor Yellow
}

