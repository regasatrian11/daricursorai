# 🔧 Fix RPC Function Errors - Step by Step

## ❌ Error yang Dihadapi
```
42601: syntax error at or near "#"
LINE 1: # Supabase Migration Instructions
```

## ✅ Solusi Cepat

### Langkah 1: Buka Supabase Dashboard
1. Pergi ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik tab **SQL Editor**

### Langkah 2: Copy SQL Script
**JANGAN copy file markdown!** Copy isi dari file `clean-migration.sql`:

```sql
-- Create get_feed_with_profiles RPC function
CREATE OR REPLACE FUNCTION get_feed_with_profiles(
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    author_name VARCHAR,
    author_username VARCHAR,
    author_avatar TEXT,
    content TEXT,
    media_url TEXT,
    media_type VARCHAR,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    saves_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_posts' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Table user_posts does not exist';
    END IF;
    
    RETURN QUERY
    SELECT
        up.id,
        up.user_id,
        up.author_name,
        up.author_username,
        up.author_avatar,
        up.content,
        up.media_url,
        up.media_type,
        up.likes_count,
        up.comments_count,
        up.shares_count,
        up.saves_count,
        up.created_at,
        up.updated_at
    FROM
        public.user_posts up
    ORDER BY
        up.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_feed_with_profiles(INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feed_with_profiles(INT, INT) TO anon;

-- Create get_post_comments RPC function
CREATE OR REPLACE FUNCTION get_post_comments(
    post_uuid UUID,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    user_id UUID,
    author_name VARCHAR,
    author_username VARCHAR,
    author_avatar TEXT,
    content TEXT,
    likes_count INTEGER,
    parent_comment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Table post_comments does not exist';
    END IF;
    
    RETURN QUERY
    SELECT
        pc.id,
        pc.post_id,
        pc.user_id,
        pc.author_name,
        pc.author_username,
        pc.author_avatar,
        pc.content,
        pc.likes_count,
        pc.parent_comment_id,
        pc.created_at,
        pc.updated_at
    FROM
        public.post_comments pc
    WHERE
        pc.post_id = post_uuid
    ORDER BY
        pc.created_at ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_post_comments(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_comments(UUID, INT, INT) TO anon;

-- Test the functions
SELECT 'RPC functions created successfully' as status;
```

### Langkah 3: Paste dan Run
1. **Paste** kode SQL di atas ke SQL Editor
2. **Klik Run** atau tekan Ctrl+Enter
3. **Tunggu** sampai selesai (akan muncul pesan sukses)

### Langkah 4: Verifikasi
Jalankan query ini untuk memastikan functions sudah dibuat:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_feed_with_profiles', 'get_post_comments');
```

## 🚨 Troubleshooting

### Jika masih error:
1. **Pastikan copy SQL script yang benar** (bukan markdown)
2. **Cek apakah tabel user_posts dan post_comments sudah ada**
3. **Pastikan Anda login sebagai admin/owner project**

### Jika tabel belum ada:
Jalankan script ini dulu untuk membuat tabel:

```sql
-- Create user_posts table
CREATE TABLE IF NOT EXISTS user_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_username VARCHAR(50) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20) DEFAULT 'text',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES user_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_username VARCHAR(50) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ✅ Hasil Setelah Migration

- ✅ RPC function errors akan hilang
- ✅ Feed akan load dengan normal
- ✅ Comments akan berfungsi
- ✅ Aplikasi akan berjalan stabil

## 📞 Butuh Bantuan?

Jika masih ada masalah:
1. Screenshot error yang muncul
2. Periksa browser console untuk error detail
3. Pastikan semua tabel sudah dibuat
4. Verifikasi RLS policies sudah aktif
