#!/usr/bin/env python3
"""
Script untuk membuat icon aplikasi Android dari logo Mikasa AI
Mengkonversi SVG ke PNG dalam berbagai resolusi
"""

import os
import subprocess
import sys

def create_android_icons():
    """Membuat icon aplikasi Android dalam berbagai resolusi"""
    
    print("🎨 Membuat icon Mikasa AI untuk Android...")
    
    # Resolusi untuk setiap density
    densities = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }
    
    # Buat folder jika belum ada
    base_path = "android/app/src/main/res"
    
    for density in densities.keys():
        folder_path = os.path.join(base_path, density)
        os.makedirs(folder_path, exist_ok=True)
        print(f"✅ Folder {density} siap")
    
    # Cek apakah ada ImageMagick atau Inkscape
    has_imagemagick = False
    has_inkscape = False
    
    try:
        subprocess.run(['magick', '--version'], capture_output=True, check=True)
        has_imagemagick = True
        print("✅ ImageMagick ditemukan")
    except:
        print("⚠️ ImageMagick tidak ditemukan")
    
    try:
        subprocess.run(['inkscape', '--version'], capture_output=True, check=True)
        has_inkscape = True
        print("✅ Inkscape ditemukan")
    except:
        print("⚠️ Inkscape tidak ditemukan")
    
    if not has_imagemagick and not has_inkscape:
        print("❌ Tidak ada tool untuk konversi SVG ke PNG")
        print("📥 Silakan install ImageMagick atau Inkscape")
        return False
    
    # Konversi SVG ke PNG untuk setiap resolusi
    for density, size in densities.items():
        folder_path = os.path.join(base_path, density)
        icon_path = os.path.join(folder_path, "ic_launcher.png")
        
        print(f"🔄 Membuat icon {size}x{size} px untuk {density}...")
        
        if has_imagemagick:
            # Gunakan ImageMagick
            cmd = [
                'magick', 'mikasa_icon.svg',
                '-resize', f'{size}x{size}',
                '-background', 'transparent',
                icon_path
            ]
        else:
            # Gunakan Inkscape
            cmd = [
                'inkscape', 'mikasa_icon.svg',
                '--export-png', icon_path,
                f'--export-width={size}',
                f'--export-height={size}'
            ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"✅ Icon {size}x{size} px berhasil dibuat")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error membuat icon {size}x{size} px: {e}")
            # Fallback: copy file placeholder
            create_placeholder_icon(icon_path, size)
    
    print("\n🎉 Semua icon aplikasi Android telah dibuat!")
    print("📱 Icon akan otomatis muncul di Android Studio")
    print("🚀 Jalankan 'npx cap sync android' untuk mengupdate aplikasi")
    return True

def create_placeholder_icon(icon_path, size):
    """Membuat icon placeholder jika konversi gagal"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Buat icon placeholder
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Background biru seperti logo asli
        draw.rounded_rectangle([0, 0, size, size], radius=size//8, fill=(59, 130, 246, 255))
        
        # Simulasi karakter anime (simplified)
        # Kepala
        head_size = size // 3
        head_x = (size - head_size) // 2
        head_y = size // 4
        draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=(255, 255, 255, 255))
        
        # Mata
        eye_size = size // 12
        left_eye_x = head_x + head_size // 3
        right_eye_x = head_x + 2 * head_size // 3
        eye_y = head_y + head_size // 3
        draw.ellipse([left_eye_x - eye_size//2, eye_y - eye_size//2, left_eye_x + eye_size//2, eye_y + eye_size//2], fill=(59, 130, 246, 255))
        draw.ellipse([right_eye_x - eye_size//2, eye_y - eye_size//2, right_eye_x + eye_size//2, eye_y + eye_size//2], fill=(59, 130, 246, 255))
        
        # Badan (simplified)
        body_width = size // 2
        body_height = size // 3
        body_x = (size - body_width) // 2
        body_y = head_y + head_size - 5
        draw.rounded_rectangle([body_x, body_y, body_x + body_width, body_y + body_height], radius=5, fill=(255, 255, 255, 255))
        
        # Simbol Q di dada
        q_size = size // 8
        q_x = body_x + body_width // 2 - q_size // 2
        q_y = body_y + body_height // 2 - q_size // 2
        draw.ellipse([q_x, q_y, q_x + q_size, q_y + q_size], fill=(59, 130, 246, 255))
        
        # Simpan icon
        img.save(icon_path, 'PNG')
        print(f"✅ Placeholder icon {size}x{size} px dibuat")
        
    except ImportError:
        print(f"⚠️ PIL tidak tersedia, tidak bisa membuat placeholder untuk {size}x{size} px")
    except Exception as e:
        print(f"❌ Error membuat placeholder icon: {e}")

if __name__ == "__main__":
    create_android_icons()
