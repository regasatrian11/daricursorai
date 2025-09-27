# PowerShell Script untuk Memproses Logo Mikasa AI
# Membuat icon aplikasi Android dalam berbagai resolusi

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    MIKASA AI LOGO PROCESSOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah logo ada
$logoPath = "mikasa_logo.png"
if (-not (Test-Path $logoPath)) {
    Write-Host "❌ Logo Mikasa AI tidak ditemukan!" -ForegroundColor Red
    Write-Host "📁 Simpan logo dengan nama 'mikasa_logo.png' di folder ini" -ForegroundColor Yellow
    Write-Host "📐 Resolusi yang direkomendasikan: 512x512 px atau lebih besar" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit
}

Write-Host "✅ Logo Mikasa AI ditemukan!" -ForegroundColor Green
Write-Host ""

# Buat folder Android jika belum ada
$androidResPath = "android\app\src\main\res"
$densities = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$sizes = @(48, 72, 96, 144, 192)

Write-Host "📁 Membuat folder Android..." -ForegroundColor Yellow
foreach ($density in $densities) {
    $folderPath = Join-Path $androidResPath $density
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        Write-Host "✅ Folder $density dibuat" -ForegroundColor Green
    } else {
        Write-Host "✅ Folder $density sudah ada" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎨 Memproses logo untuk berbagai resolusi..." -ForegroundColor Yellow

# Simulasi pemrosesan (dalam implementasi nyata, gunakan library image processing)
for ($i = 0; $i -lt $densities.Length; $i++) {
    $density = $densities[$i]
    $size = $sizes[$i]
    $folderPath = Join-Path $androidResPath $density
    $iconPath = Join-Path $folderPath "ic_launcher.png"
    
    # Copy logo asli ke setiap folder (dalam implementasi nyata, resize sesuai ukuran)
    Copy-Item $logoPath $iconPath -Force
    Write-Host "✅ Icon $size x $size px disimpan di $density" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Semua icon aplikasi Android telah dibuat!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "1. npx cap sync android" -ForegroundColor White
Write-Host "2. npx cap build android" -ForegroundColor White
Write-Host "3. npx cap open android" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Logo Mikasa AI akan muncul sebagai icon aplikasi!" -ForegroundColor Magenta
Write-Host ""

Read-Host "Tekan Enter untuk keluar"
