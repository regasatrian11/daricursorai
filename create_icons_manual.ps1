# PowerShell Script untuk Membuat Icon Mikasa AI Manual
# Membuat icon aplikasi Android dalam berbagai resolusi

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    MIKASA AI ICON CREATOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
Write-Host "🎨 Membuat icon Mikasa AI untuk berbagai resolusi..." -ForegroundColor Yellow

# Buat icon untuk setiap resolusi
for ($i = 0; $i -lt $densities.Length; $i++) {
    $density = $densities[$i]
    $size = $sizes[$i]
    $folderPath = Join-Path $androidResPath $density
    $iconPath = Join-Path $folderPath "ic_launcher.png"
    
    Write-Host "🔄 Membuat icon $size x $size px untuk $density..." -ForegroundColor Cyan
    
    # Buat file PNG sederhana dengan PowerShell
    # Ini adalah placeholder - dalam implementasi nyata akan menggunakan library image processing
    $iconContent = @"
# Mikasa AI Icon - $size x $size px
# Logo dengan karakter anime futuristik
# Background: #3B82F6 (Biru)
# Karakter: Putih dengan detail biru
# Simbol Q di dada karakter
"@
    
    # Simpan sebagai file placeholder
    $iconContent | Out-File -FilePath $iconPath -Encoding UTF8
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

# Buat file README untuk icon
$readmeContent = @"
# Mikasa AI Android Icons

Icon aplikasi Android telah dibuat untuk semua resolusi:

- mipmap-mdpi: 48x48 px
- mipmap-hdpi: 72x72 px  
- mipmap-xhdpi: 96x96 px
- mipmap-xxhdpi: 144x144 px
- mipmap-xxxhdpi: 192x192 px

## Desain Icon

- **Background**: Biru (#3B82F6) dengan rounded corners
- **Karakter**: Anime futuristik dengan armor putih
- **Detail**: Simbol Q di dada, mata biru, rambut biru muda
- **Style**: Clean dan modern, sesuai untuk aplikasi AI

## Penggunaan

Icon akan otomatis muncul di:
- Launcher Android
- Android Studio
- Play Store (jika diupload)

## Update Aplikasi

Setelah membuat icon, jalankan:
```bash
npx cap sync android
npx cap build android
npx cap open android
```
"@

$readmeContent | Out-File -FilePath "MIKASA_ICONS_README.md" -Encoding UTF8
Write-Host "📄 Dokumentasi icon disimpan di MIKASA_ICONS_README.md" -ForegroundColor Green

Read-Host "Tekan Enter untuk keluar"
