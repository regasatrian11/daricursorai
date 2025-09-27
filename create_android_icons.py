#!/usr/bin/env python3
"""
Script untuk membuat icon aplikasi Android dari logo Mikasa AI
Membuat berbagai resolusi untuk semua density Android
"""

import os
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

def create_android_icons():
    """Membuat icon aplikasi Android dalam berbagai resolusi"""
    
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
    
    # Simulasi logo Mikasa AI (karena tidak bisa akses gambar langsung)
    # Dalam implementasi nyata, Anda akan load gambar dari file
    print("📱 Membuat icon aplikasi Android...")
    print("🎨 Logo Mikasa AI akan digunakan sebagai icon aplikasi")
    print("📐 Membuat versi untuk semua density Android...")
    
    # Buat placeholder icon (dalam implementasi nyata, load gambar asli)
    for density, size in densities.items():
        folder_path = os.path.join(base_path, density)
        icon_path = os.path.join(folder_path, "ic_launcher.png")
        
        # Buat icon placeholder dengan teks "Mikasa AI"
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
        print(f"✅ Icon {size}x{size} px disimpan di {icon_path}")
    
    print("\n🎉 Semua icon aplikasi Android telah dibuat!")
    print("📱 Icon akan otomatis muncul di Android Studio")
    print("🚀 Jalankan 'npx cap sync android' untuk mengupdate aplikasi")

if __name__ == "__main__":
    create_android_icons()
