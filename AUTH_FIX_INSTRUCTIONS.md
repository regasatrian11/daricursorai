# Instruksi Perbaikan Login Real User

## Masalah yang Ditemukan
Sistem selalu memprioritaskan demo user dari localStorage, sehingga real user tidak bisa login dengan benar.

## Solusi

### 1. Hapus Demo User Data Saat Login Real User

Buka file `src/hooks/useSupabaseAuth.ts` dan cari function `signIn` (sekitar baris 317).

**Ganti kode ini:**
```javascript
if (user) {
  console.log('✅ Signin successful')
  setUser(user)
  
  // Save user data to localStorage for profile updates
  // Check if there's existing user data with profileImage
  const existingUserData = localStorage.getItem('mikasa_user');
  let existingProfileImage = null;
  if (existingUserData) {
    try {
      const parsed = JSON.parse(existingUserData);
      existingProfileImage = parsed.profileImage || null;
      console.log('💾 Found existing profile image:', existingProfileImage);
    } catch (error) {
      console.log('Error parsing existing user data:', error);
    }
  }
```

**Dengan kode ini:**
```javascript
if (user) {
  console.log('✅ Signin successful')
  setUser(user)
  
  // Clear demo user data if exists
  const existingUserData = localStorage.getItem('mikasa_user');
  if (existingUserData) {
    try {
      const parsed = JSON.parse(existingUserData);
      if (parsed.isDemo) {
        console.log('🧹 Clearing demo user data for real user login');
        localStorage.removeItem('mikasa_user');
        localStorage.removeItem('mikasa_session');
      }
    } catch (error) {
      console.log('Error parsing existing user data:', error);
    }
  }
  
  // Save user data to localStorage for profile updates
  // Check if there's existing user data with profileImage
  let existingProfileImage = null;
  if (existingUserData) {
    try {
      const parsed = JSON.parse(existingUserData);
      if (!parsed.isDemo) {
        existingProfileImage = parsed.profileImage || null;
        console.log('💾 Found existing profile image:', existingProfileImage);
      }
    } catch (error) {
      console.log('Error parsing existing user data:', error);
    }
  }
```

### 2. Perbaiki Logika getInitialUser

Cari function `getInitialUser` (sekitar baris 23) dan ganti logika prioritas:

**Ganti kode ini:**
```javascript
if (savedUser) {
  try {
    const userData = JSON.parse(savedUser);
    if (userData.isDemo) {
      console.log('🎭 Demo user found in localStorage - setting user state');
      // Set demo user state
      if (mounted) {
        setUser(userData);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }
    } else if (savedSession) {
```

**Dengan kode ini:**
```javascript
if (savedUser) {
  try {
    const userData = JSON.parse(savedUser);
    if (!userData.isDemo && savedSession) {
      console.log('👤 Real user session found - restoring session');
      // For real users, check if session is still valid
      const sessionData = JSON.parse(savedSession);
      const now = Date.now();
      const sessionExpiry = sessionData.expires_at;
      
      if (sessionExpiry && now < sessionExpiry) {
        // Session is still valid
        if (mounted) {
          setUser(userData);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }
      } else {
        console.log('⏰ Session expired, clearing user data');
        localStorage.removeItem('mikasa_user');
        localStorage.removeItem('mikasa_session');
      }
    } else if (userData.isDemo) {
      console.log('🎭 Demo user found in localStorage - setting user state');
      // Set demo user state
      if (mounted) {
        setUser(userData);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }
    }
  } catch (error) {
    console.error('❌ Error parsing saved user data:', error);
    // Clear corrupted data
    localStorage.removeItem('mikasa_user');
    localStorage.removeItem('mikasa_session');
  }
}
```

### 3. Test Login Real User

1. **Buka aplikasi** - http://localhost:5174/
2. **Klik "Masuk"** - Masukkan email dan password real user
3. **Verifikasi** - Pastikan tidak ada demo user yang muncul
4. **Cek console** - Pastikan ada log "🧹 Clearing demo user data for real user login"

### 4. Troubleshooting

**Jika masih muncul demo user:**
1. **Clear localStorage** - Buka Developer Tools > Application > Storage > Clear All
2. **Refresh halaman** - Tekan F5 atau Ctrl+R
3. **Login ulang** - Masukkan email dan password real user

**Jika real user tidak bisa login:**
1. **Cek email/password** - Pastikan benar
2. **Cek Supabase** - Pastikan akun ada di database
3. **Cek console** - Lihat error message

## Hasil yang Diharapkan

- ✅ Real user bisa login dengan benar
- ✅ Demo user tidak mengganggu login real user
- ✅ Session real user tersimpan dengan benar
- ✅ Profile real user ditampilkan dengan benar

## File yang Dimodifikasi

- `src/hooks/useSupabaseAuth.ts` - Logika autentikasi
- `src/services/auth.ts` - Service autentikasi (jika perlu)

## Support

Jika masih ada masalah, cek:
1. Browser Console untuk error details
2. Network tab untuk request/response
3. Supabase Dashboard untuk user data
4. localStorage untuk user data
