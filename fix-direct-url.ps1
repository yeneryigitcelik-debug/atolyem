# DIRECT_URL Düzeltme Script'i

Write-Host "=== DIRECT_URL Düzeltme ===" -ForegroundColor Cyan
Write-Host ""

# Doğru connection string
$correctDirectUrl = "postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"

if (Test-Path .env) {
    Write-Host "1. .env dosyası okunuyor..." -ForegroundColor Yellow
    $envContent = Get-Content .env
    
    # Mevcut DIRECT_URL'i bul
    $directUrlLine = $envContent | Select-String -Pattern "^DIRECT_URL"
    
    if ($directUrlLine) {
        Write-Host "   Mevcut DIRECT_URL bulundu:" -ForegroundColor Gray
        Write-Host "   $directUrlLine" -ForegroundColor Gray
        Write-Host ""
        
        # Kullanıcı adını kontrol et
        if ($directUrlLine -match "postgres:") {
            Write-Host "   ⚠️  Kullanıcı adı yanlış! 'postgres' yerine 'postgres.tlyuixjkgrpazfezqbxp' olmalı" -ForegroundColor Red
            Write-Host ""
            Write-Host "2. DIRECT_URL düzeltiliyor..." -ForegroundColor Yellow
            
            # DIRECT_URL satırını değiştir
            $newEnvContent = $envContent | ForEach-Object {
                if ($_ -match "^DIRECT_URL") {
                    "DIRECT_URL=`"$correctDirectUrl`""
                } else {
                    $_
                }
            }
            
            # .env dosyasını güncelle
            $newEnvContent | Set-Content .env -Encoding UTF8
            Write-Host "   ✅ DIRECT_URL düzeltildi!" -ForegroundColor Green
        } else {
            Write-Host "   ✅ DIRECT_URL doğru görünüyor" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ DIRECT_URL bulunamadı!" -ForegroundColor Red
        Write-Host ""
        Write-Host "2. DIRECT_URL ekleniyor..." -ForegroundColor Yellow
        
        # DIRECT_URL'i ekle
        Add-Content -Path .env -Value "`nDIRECT_URL=`"$correctDirectUrl`"" -Encoding UTF8
        Write-Host "   ✅ DIRECT_URL eklendi!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "3. Güncel DIRECT_URL:" -ForegroundColor Yellow
    Get-Content .env | Select-String -Pattern "^DIRECT_URL" | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Gray
    }
    
} else {
    Write-Host "❌ .env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Sonraki Adımlar ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Supabase Dashboard'da projenizin ACTIVE olduğundan emin olun:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   Projeniz > Settings > General" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Network restrictions kontrol edin:" -ForegroundColor Yellow
Write-Host "   Settings > Database > Network restrictions" -ForegroundColor Gray
Write-Host "   Eğer IP whitelist varsa, local IP'nizi ekleyin" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Prisma Studio'yu yeniden başlatın:" -ForegroundColor Yellow
Write-Host "   npx prisma studio" -ForegroundColor Green

