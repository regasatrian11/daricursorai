@echo off
echo ========================================
echo    SAVE ANDROID PHOTOS SCRIPT
echo ========================================
echo.

echo Membuat folder untuk foto Android...
if not exist "android\app\src\main\res\drawable-hdpi" mkdir "android\app\src\main\res\drawable-hdpi"
if not exist "android\app\src\main\res\drawable-mdpi" mkdir "android\app\src\main\res\drawable-mdpi"
if not exist "android\app\src\main\res\drawable-xhdpi" mkdir "android\app\src\main\res\drawable-xhdpi"
if not exist "android\app\src\main\res\drawable-xxhdpi" mkdir "android\app\src\main\res\drawable-xxhdpi"
if not exist "android\app\src\main\res\drawable-xxxhdpi" mkdir "android\app\src\main\res\drawable-xxxhdpi"

echo.
echo Folder Android sudah siap!
echo.
echo Silakan simpan foto dengan nama:
echo - ic_launcher.png (untuk icon aplikasi)
echo - default_avatar.png (untuk foto profil default)
echo - default_cover.png (untuk foto sampul default)
echo.
echo Di folder: android\app\src\main\res\drawable-xxxhdpi\
echo.
echo Setelah menyimpan foto, jalankan:
echo npx cap sync android
echo npx cap build android
echo.
pause
