# Prisma Dosya Kilitleme Sorunu Çözüm Script'i

Write-Host "=== Prisma Dosya Kilitleme Sorunu ===" -ForegroundColor Cyan
Write-Host ""

# 1. Node process'lerini kontrol et
Write-Host "1. Node process'leri kontrol ediliyor..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
if ($nodeProcesses) {
    Write-Host "   Bulunan Node process'leri:" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "   - $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "   ⚠️  Bu process'leri kapatmaniz gerekiyor!" -ForegroundColor Red
    Write-Host "   Task Manager'dan veya su komutla kapatabilirsiniz:" -ForegroundColor Yellow
    Write-Host "   Stop-Process -Name node -Force" -ForegroundColor Green
} else {
    Write-Host "   ✅ Node process bulunamadi" -ForegroundColor Green
}

Write-Host ""

# 2. Kilitli dosyayı silmeyi dene
Write-Host "2. Kilitli dosyayi silmeyi deniyor..." -ForegroundColor Yellow
$lockedFile = "node_modules\.prisma\client\query_engine-windows.dll.node"
$tempFile = "node_modules\.prisma\client\query_engine-windows.dll.node.tmp*"

try {
    # Temp dosyalarını sil
    Get-ChildItem -Path "node_modules\.prisma\client\" -Filter "query_engine-windows.dll.node.tmp*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    
    # Ana dosyayı sil
    if (Test-Path $lockedFile) {
        Remove-Item -Path $lockedFile -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Dosya silindi" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Dosya zaten yok" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Dosya silinemedi: $_" -ForegroundColor Red
    Write-Host "   Manuel olarak silmeyi deneyin veya bilgisayari yeniden baslatin" -ForegroundColor Yellow
}

Write-Host ""

# 3. Prisma generate komutunu çalıştır
Write-Host "3. Prisma generate calistiriliyor..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host ""
    Write-Host "✅ Basarili! Prisma Studio'yu baslatabilirsiniz:" -ForegroundColor Green
    Write-Host "   npx prisma studio" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Hata: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternatif cozumler:" -ForegroundColor Yellow
    Write-Host "1. Bilgisayari yeniden baslatin" -ForegroundColor Gray
    Write-Host "2. Antivirus programini gecici olarak kapatin" -ForegroundColor Gray
    Write-Host "3. node_modules klasorunu silip 'npm install' calistirin" -ForegroundColor Gray
}

