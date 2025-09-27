# Instruksi Perbaikan Database

## Masalah yang Ditemukan
1. **Column `parent_id` tidak ada** di tabel `post_comments`
2. **Column `author_username` tidak ada** di tabel `user_posts`
3. **Table `comment_likes` tidak ditemukan**
4. **RPC functions tidak ditemukan**

## Solusi

### Opsi 1: Jalankan Migration Manual (Recommended)

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/dsxiymksrubpryxggyow/sql
   - Klik "New Query"

2. **Jalankan SQL Migration**
   Copy dan paste kode berikut:

```sql
-- Quick fix for database issues

-- 1. Add missing columns to post_comments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'parent_id') THEN
        ALTER TABLE post_comments ADD COLUMN parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Add missing columns to user_posts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_posts' AND column_name = 'author_username') THEN
        ALTER TABLE user_posts ADD COLUMN author_username TEXT;
    END IF;
END $$;

-- 3. Add likes_count to post_comments if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'likes_count') THEN
        ALTER TABLE post_comments ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. Create comment_likes table if not exists
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 5. Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comment_likes_comment_id_fkey') THEN
        ALTER TABLE comment_likes ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comment_likes_user_id_fkey') THEN
        ALTER TABLE comment_likes ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Enable RLS on comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for comment_likes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_likes' AND policyname = 'Users can view all comment likes') THEN
        CREATE POLICY "Users can view all comment likes" ON comment_likes FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_likes' AND policyname = 'Users can like comments') THEN
        CREATE POLICY "Users can like comments" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_likes' AND policyname = 'Users can unlike their own likes') THEN
        CREATE POLICY "Users can unlike their own likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_likes_count ON post_comments(likes_count);

-- 9. Create function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count(comment_uuid UUID, change_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE post_comments 
  SET likes_count = COALESCE(likes_count, 0) + change_amount
  WHERE id = comment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Klik "Run"** untuk menjalankan migration

### Opsi 2: Gunakan Supabase CLI

```bash
# Install Supabase CLI jika belum ada
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project
supabase link --project-ref dsxiymksrubpryxggyow

# Jalankan migration
supabase db push
```

### Opsi 3: Gunakan Aplikasi (Fallback Mode)

Jika migration tidak bisa dijalankan, aplikasi akan otomatis menggunakan localStorage sebagai fallback. Fitur like komentar tetap berfungsi, hanya data disimpan di browser.

## Verifikasi

Setelah migration selesai, cek:

1. **Tabel `post_comments`** harus memiliki kolom:
   - `parent_id` (UUID)
   - `likes_count` (INTEGER)

2. **Tabel `user_posts`** harus memiliki kolom:
   - `author_username` (TEXT)

3. **Tabel `comment_likes`** harus ada dengan struktur:
   - `id` (UUID, Primary Key)
   - `comment_id` (UUID, Foreign Key)
   - `user_id` (UUID, Foreign Key)
   - `created_at` (TIMESTAMP)

4. **Function `update_comment_likes_count`** harus ada

## Test Aplikasi

1. Buka http://localhost:5174/
2. Cek console browser - tidak ada error 400/404
3. Test fitur like komentar
4. Test buat komentar baru
5. Test buat postingan baru

## Troubleshooting

### Error "Column does not exist"
- Pastikan migration sudah dijalankan
- Refresh halaman aplikasi
- Clear browser cache

### Error "Table not found"
- Cek apakah tabel `comment_likes` sudah dibuat
- Pastikan RLS policies sudah dibuat

### Error "Function not found"
- Cek apakah function `update_comment_likes_count` sudah dibuat
- Pastikan function memiliki SECURITY DEFINER

## Support

Jika masih ada masalah, cek:
1. Supabase Dashboard > SQL Editor
2. Supabase Dashboard > Table Editor
3. Browser Console untuk error details
4. Network tab untuk request/response
