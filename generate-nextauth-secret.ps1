# NEXTAUTH_SECRET Oluşturma Script'i

Write-Host "=== NEXTAUTH_SECRET Oluşturma ===" -ForegroundColor Cyan
Write-Host ""

try {
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $bytes = New-Object byte[] 32
    $rng.GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes)
    
    Write-Host "✅ NEXTAUTH_SECRET oluşturuldu:" -ForegroundColor Green
    Write-Host $secret -ForegroundColor Gray
    Write-Host ""
    Write-Host "Bu değeri Vercel'de NEXTAUTH_SECRET olarak ekleyin:" -ForegroundColor Yellow
    Write-Host "Vercel Dashboard > Settings > Environment Variables > Production" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Key: NEXTAUTH_SECRET" -ForegroundColor Gray
    Write-Host "Value: $secret" -ForegroundColor Gray
    Write-Host "Environment: Production" -ForegroundColor Gray
    
} catch {
    Write-Host "Alternatif yöntem kullanılıyor..." -ForegroundColor Yellow
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $secret = -join (1..43 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    Write-Host ""
    Write-Host "✅ NEXTAUTH_SECRET oluşturuldu:" -ForegroundColor Green
    Write-Host $secret -ForegroundColor Gray
}

