# Cara Membersihkan Data Lama dan Mengganti Nama

## Masalah
- Nama "regasatria" muncul di postingan (data lama)
- Nama "Demo User" muncul di komentar (sudah diperbaiki)

## Solusi

### 1. Buka Console Browser
Tekan `F12` atau klik kanan → Inspect → Console

### 2. Jalankan Perintah Berikut

```javascript
// Hapus semua data lama
localStorage.clear();

// Atau hapus data spesifik
localStorage.removeItem('mikasa_posts');
localStorage.removeItem('mikasa_comments');
localStorage.removeItem('mikasa_user');
localStorage.removeItem('mikasa_all_users');
localStorage.removeItem('mikasa_feed_data');

// Set user baru dengan nama yang Anda inginkan
const newUser = {
  id: `user-${Date.now()}`,
  name: 'Nama Anda',
  full_name: 'Nama Anda',
  username: 'namaanda',
  email: 'namaanda@example.com',
  profileImage: `https://ui-avatars.com/api/?name=Nama%20Anda&background=3b82f6&color=fff&size=40`,
  avatar: `https://ui-avatars.com/api/?name=Nama%20Anda&background=3b82f6&color=fff&size=40`,
  isDemo: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

localStorage.setItem('mikasa_user', JSON.stringify(newUser));

console.log('✅ Data lama dihapus, user baru diset');
```

### 3. Refresh Halaman
Tekan `F5` atau `Ctrl+R` untuk refresh halaman

### 4. Test Aplikasi
- Coba buat postingan baru
- Coba buat komentar
- Nama yang muncul seharusnya sudah sesuai dengan yang Anda set

## Alternatif: Gunakan Fungsi yang Sudah Dibuat

Jika Anda ingin menggunakan fungsi yang sudah saya buat, jalankan:

```javascript
// Import fungsi (jika menggunakan module system)
import { clearOldData, setNewUser } from './src/utils/clearOldData';

// Atau definisikan langsung di console
function clearOldData() {
  localStorage.clear();
  console.log('✅ Old data cleared');
}

function setNewUser(name) {
  const newUser = {
    id: `user-${Date.now()}`,
    name: name,
    full_name: name,
    username: name.toLowerCase().replace(/\s+/g, ''),
    email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=40`,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=40`,
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('mikasa_user', JSON.stringify(newUser));
  console.log('✅ New user set:', newUser);
}

// Jalankan
clearOldData();
setNewUser('Nama Anda');
```

## Catatan
- Data lama akan dihapus permanen
- Semua postingan dan komentar lama akan hilang
- Aplikasi akan mulai fresh dengan nama baru
- Perubahan akan berlaku setelah refresh halaman
