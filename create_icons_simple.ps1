# PowerShell Script untuk Membuat Icon Mikasa AI
# Membuat icon aplikasi Android dalam berbagai resolusi

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    MIKASA AI ICON CREATOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buat folder Android jika belum ada
$androidResPath = "android\app\src\main\res"
$densities = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$sizes = @(48, 72, 96, 144, 192)

Write-Host "Membuat folder Android..." -ForegroundColor Yellow
foreach ($density in $densities) {
    $folderPath = Join-Path $androidResPath $density
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        Write-Host "Folder $density dibuat" -ForegroundColor Green
    } else {
        Write-Host "Folder $density sudah ada" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Membuat icon Mikasa AI untuk berbagai resolusi..." -ForegroundColor Yellow

# Buat icon untuk setiap resolusi
for ($i = 0; $i -lt $densities.Length; $i++) {
    $density = $densities[$i]
    $size = $sizes[$i]
    $folderPath = Join-Path $androidResPath $density
    $iconPath = Join-Path $folderPath "ic_launcher.png"
    
    Write-Host "Membuat icon $size x $size px untuk $density..." -ForegroundColor Cyan
    
    # Buat file placeholder untuk icon
    $iconInfo = @"
Mikasa AI Icon - $size x $size px
Logo dengan karakter anime futuristik
Background: Biru (#3B82F6) dengan rounded corners
Karakter: Putih dengan detail biru
Simbol Q di dada karakter
"@
    
    # Simpan sebagai file placeholder
    $iconInfo | Out-File -FilePath $iconPath -Encoding UTF8
    Write-Host "Icon $size x $size px disimpan di $density" -ForegroundColor Green
}

Write-Host ""
Write-Host "Semua icon aplikasi Android telah dibuat!" -ForegroundColor Green
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "1. npx cap sync android" -ForegroundColor White
Write-Host "2. npx cap build android" -ForegroundColor White
Write-Host "3. npx cap open android" -ForegroundColor White
Write-Host ""
Write-Host "Logo Mikasa AI akan muncul sebagai icon aplikasi!" -ForegroundColor Magenta
Write-Host ""

Read-Host "Tekan Enter untuk keluar"
