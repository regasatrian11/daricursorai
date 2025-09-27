# 🔧 Fix Guide: Comments & Posts Functionality

## 🚨 **Masalah yang Ditemukan:**

1. **❌ Tabel `posts` dan `comments` belum dibuat di database**
2. **❌ Error import di FriendsService (sudah diperbaiki)**
3. **❌ Komentar tidak bisa dilihat**
4. **❌ Hapus postingan tidak berfungsi dengan benar**

## ✅ **Solusi yang Telah Dibuat:**

### **1. SQL Script untuk Database**
- ✅ File: `supabase_posts_comments_setup.sql`
- ✅ Membuat tabel `posts` dan `comments`
- ✅ Row Level Security (RLS) untuk keamanan
- ✅ Functions untuk CRUD operations
- ✅ Indexes untuk performa

### **2. Import Error Fix**
- ✅ FriendsService import path sudah diperbaiki
- ✅ Development server sudah di-restart

## 📋 **Langkah-langkah untuk Memperbaiki:**

### **Step 1: Jalankan SQL Script di Supabase**

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project Anda
   - Buka **SQL Editor**

2. **Salin dan Jalankan SQL**
   - **SALIN SEMUA KODE** dari file `supabase_posts_comments_setup.sql`
   - **PASTE** ke SQL Editor
   - **KLIK RUN** atau **EXECUTE**

### **Step 2: Verifikasi Setup Berhasil**

Jalankan query verifikasi ini di SQL Editor:

```sql
-- Cek apakah tabel sudah dibuat
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('posts', 'comments');

-- Cek apakah RLS sudah diaktifkan
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('posts', 'comments');

-- Cek apakah functions sudah dibuat
SELECT proname FROM pg_proc 
WHERE proname IN (
  'get_feed_with_profiles', 'create_post', 'update_post', 'delete_post', 
  'get_post_comments', 'create_comment', 'update_comment', 'delete_comment',
  'like_post', 'unlike_post', 'save_post', 'unsave_post'
);
```

### **Step 3: Test Functionality**

1. **Test Comments:**
   - Buka FeedPage
   - Klik tombol komentar pada postingan
   - Modal komentar harus terbuka
   - Komentar harus bisa ditambahkan dan dilihat

2. **Test Post Deletion:**
   - Buat postingan baru
   - Klik tombol hapus (trash icon)
   - Konfirmasi dialog harus muncul
   - Postingan harus terhapus

## 🗄️ **Database Schema yang Dibuat:**

### **Posts Table:**
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    media_type VARCHAR(20) DEFAULT 'text',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Comments Table:**
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id),
    user_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 **Security Features:**

### **Row Level Security (RLS):**
- ✅ **Posts**: User hanya bisa CRUD postingan sendiri
- ✅ **Comments**: User hanya bisa CRUD komentar sendiri
- ✅ **Public Read**: Semua user bisa lihat postingan dan komentar

### **Policies:**
- ✅ **SELECT**: Semua user bisa baca
- ✅ **INSERT**: User hanya bisa buat postingan/komentar sendiri
- ✅ **UPDATE**: User hanya bisa edit postingan/komentar sendiri
- ✅ **DELETE**: User hanya bisa hapus postingan/komentar sendiri

## ⚙️ **Database Functions:**

### **Posts Functions:**
- ✅ `get_feed_with_profiles()` - Ambil feed dengan data profil
- ✅ `create_post()` - Buat postingan baru
- ✅ `update_post()` - Update postingan
- ✅ `delete_post()` - Hapus postingan
- ✅ `like_post()` / `unlike_post()` - Like/unlike
- ✅ `save_post()` / `unsave_post()` - Save/unsave

### **Comments Functions:**
- ✅ `get_post_comments()` - Ambil komentar postingan
- ✅ `create_comment()` - Buat komentar baru
- ✅ `update_comment()` - Update komentar
- ✅ `delete_comment()` - Hapus komentar

## 🎯 **Expected Results:**

### **After SQL Setup:**
1. ✅ **Comments Modal** - Bisa dibuka dan menampilkan komentar
2. ✅ **Add Comments** - Bisa menambah komentar baru
3. ✅ **Post Deletion** - Hanya pemilik yang bisa hapus
4. ✅ **Security** - RLS mencegah akses tidak sah
5. ✅ **Performance** - Indexes untuk query cepat

### **UI Behavior:**
- ✅ **Comment Button** - Membuka modal komentar
- ✅ **Delete Button** - Hanya muncul untuk postingan sendiri
- ✅ **Confirmation Dialog** - Muncul sebelum hapus postingan
- ✅ **Real-time Updates** - Komentar terupdate langsung

## ⚠️ **Important Notes:**

1. **Jalankan SQL Script SEKALIGUS** - jangan potong-potong
2. **Pastikan tidak ada ERROR** saat menjalankan script
3. **Verifikasi dengan query** di atas
4. **Test functionality** setelah setup selesai

## 🚀 **Next Steps:**

1. **Jalankan SQL script** di Supabase Dashboard
2. **Verifikasi setup** dengan query di atas
3. **Test comments** di FeedPage
4. **Test post deletion** di FeedPage
5. **Verify security** - coba hapus postingan orang lain (harus gagal)

**Setelah SQL script dijalankan, semua masalah komentar dan hapus postingan akan teratasi!** 🎉
