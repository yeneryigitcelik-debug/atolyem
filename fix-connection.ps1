# Connection String Düzeltme Script'i

Write-Host "=== Supabase Connection String Düzeltme ===" -ForegroundColor Cyan
Write-Host ""

# Mevcut .env dosyasını oku
if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    
    # DATABASE_URL'i bul
    if ($envContent -match 'DATABASE_URL\s*=\s*"([^"]+)"') {
        $currentUrl = $matches[1]
        Write-Host "Mevcut DATABASE_URL:" -ForegroundColor Yellow
        Write-Host $currentUrl -ForegroundColor Gray
        Write-Host ""
        
        # Password'u çıkar
        if ($currentUrl -match "postgresql://postgres:([^@]+)@") {
            $password = $matches[1]
            Write-Host "Password bulundu (güvenlik için gösterilmiyor)" -ForegroundColor Green
            Write-Host ""
            
            Write-Host "Connection pooling string'i oluşturuluyor..." -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Lütfen Supabase Dashboard'dan region bilgisini alın:" -ForegroundColor Yellow
            Write-Host "Settings > Database > Connection pooling > URI" -ForegroundColor Gray
            Write-Host ""
            
            $region = Read-Host "Region (örn: eu-central-1, us-east-1, vb.)"
            
            if ($region) {
                $poolingUrl = "postgresql://postgres.tlyuixjkgrpazfezqbxp:$password@aws-0-$region.pooler.supabase.com:6543/postgres?pgbouncer=true"
                
                Write-Host ""
                Write-Host "Yeni connection pooling string:" -ForegroundColor Green
                Write-Host $poolingUrl -ForegroundColor Gray
                Write-Host ""
                
                $confirm = Read-Host ".env dosyasını güncellemek ister misiniz? (y/n)"
                
                if ($confirm -eq "y" -or $confirm -eq "Y") {
                    # .env dosyasını güncelle
                    $newContent = $envContent -replace 'DATABASE_URL\s*=\s*"[^"]+"', "DATABASE_URL=`"$poolingUrl`""
                    Set-Content -Path .env -Value $newContent
                    Write-Host ""
                    Write-Host "✅ .env dosyası güncellendi!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Şimdi test edin:" -ForegroundColor Cyan
                    Write-Host "npx prisma migrate status" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "⚠️  Connection string'den password çıkarılamadı" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  .env dosyasında DATABASE_URL bulunamadı" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  .env dosyası bulunamadı" -ForegroundColor Yellow
}

