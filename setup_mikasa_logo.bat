@echo off
echo ========================================
echo    SETUP MIKASA AI LOGO FOR ANDROID
echo ========================================
echo.

echo Membuat icon aplikasi Android dari logo Mikasa AI...
echo.

echo Membuat folder Android jika belum ada...
if not exist "android\app\src\main\res\mipmap-mdpi" mkdir "android\app\src\main\res\mipmap-mdpi"
if not exist "android\app\src\main\res\mipmap-hdpi" mkdir "android\app\src\main\res\mipmap-hdpi"
if not exist "android\app\src\main\res\mipmap-xhdpi" mkdir "android\app\src\main\res\mipmap-xhdpi"
if not exist "android\app\src\main\res\mipmap-xxhdpi" mkdir "android\app\src\main\res\mipmap-xxhdpi"
if not exist "android\app\src\main\res\mipmap-xxxhdpi" mkdir "android\app\src\main\res\mipmap-xxxhdpi"

echo.
echo ========================================
echo    INSTRUKSI MANUAL
echo ========================================
echo.
echo 1. Simpan logo Mikasa AI dengan nama 'mikasa_logo.png' di folder ini
echo 2. Resolusi yang direkomendasikan: 512x512 px atau lebih besar
echo 3. Format: PNG dengan transparansi
echo.
echo 4. Setelah menyimpan logo, jalankan:
echo    python create_android_icons.py
echo.
echo 5. Kemudian jalankan:
echo    npx cap sync android
echo    npx cap build android
echo.
echo ========================================
echo    STRUKTUR FOLDER ANDROID
echo ========================================
echo.
echo android\app\src\main\res\
echo ├── mipmap-mdpi\     (48x48 px)
echo ├── mipmap-hdpi\     (72x72 px)
echo ├── mipmap-xhdpi\    (96x96 px)
echo ├── mipmap-xxhdpi\   (144x144 px)
echo └── mipmap-xxxhdpi\  (192x192 px)
echo.
echo Setiap folder akan berisi ic_launcher.png
echo.
pause
