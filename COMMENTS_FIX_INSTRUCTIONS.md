# Instruksi Perbaikan Comments Database

## Masalah yang Ditemukan
1. **React Warning**: `Cannot update a component while rendering a different component`
2. **Database Error**: `Could not find the table 'public.comment_likes' in the schema cache`
3. **Database Error**: `Could not find the 'author_avatar' column of 'post_comments' in the schema cache`

## Solusi

### Opsi 1: Jalankan Migration Manual (Recommended)

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/dsxiymksrubpryxggyow/sql
   - Klik "New Query"

2. **Jalankan SQL Migration**
   Copy dan paste kode berikut:

```sql
-- Fix missing columns in post_comments table

-- 1. Add missing columns to post_comments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'author_avatar') THEN
        ALTER TABLE post_comments ADD COLUMN author_avatar TEXT;
        RAISE NOTICE '✅ Added author_avatar column to post_comments table';
    ELSE
        RAISE NOTICE '💡 author_avatar column already exists in post_comments table';
    END IF;
END $$;

-- 2. Add author_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'author_name') THEN
        ALTER TABLE post_comments ADD COLUMN author_name TEXT;
        RAISE NOTICE '✅ Added author_name column to post_comments table';
    ELSE
        RAISE NOTICE '💡 author_name column already exists in post_comments table';
    END IF;
END $$;

-- 3. Add author_username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'author_username') THEN
        ALTER TABLE post_comments ADD COLUMN author_username TEXT;
        RAISE NOTICE '✅ Added author_username column to post_comments table';
    ELSE
        RAISE NOTICE '💡 author_username column already exists in post_comments table';
    END IF;
END $$;

-- 4. Create comment_likes table if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_post_comments_author_name ON post_comments(author_name);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_username ON post_comments(author_username);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- 9. Create RPC functions for comments
CREATE OR REPLACE FUNCTION add_comment(
  post_uuid UUID,
  user_uuid UUID,
  comment_content TEXT,
  parent_comment_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_comment_id UUID;
  author_name TEXT;
  author_avatar TEXT;
  author_username TEXT;
BEGIN
  -- Get user profile info
  SELECT 
    COALESCE(full_name, username, 'Anonymous'),
    COALESCE(avatar_url, 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=40'),
    COALESCE(username, 'user')
  INTO author_name, author_avatar, author_username
  FROM profiles
  WHERE id = user_uuid;
  
  -- Insert comment
  INSERT INTO post_comments (
    post_id, user_id, parent_id, content, 
    author_name, author_avatar, author_username, likes_count
  ) VALUES (
    post_uuid, user_uuid, parent_comment_uuid, comment_content,
    author_name, author_avatar, author_username, 0
  ) RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to update comment likes count
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

### Opsi 2: Gunakan Aplikasi (Fallback Mode)

Jika migration tidak bisa dijalankan, aplikasi akan otomatis menggunakan localStorage sebagai fallback. Fitur komentar dan like tetap berfungsi, hanya data disimpan di browser.

## Perbaikan React Warning

Sudah diperbaiki dengan menggunakan `setTimeout` untuk memanggil `onCommentsCountChange`:

```javascript
// Sebelum: setState dalam render
setComments(prev => {
  const updatedComments = [...prev, newComment];
  onCommentsCountChange?.(updatedComments.length); // ❌ setState dalam render
  return updatedComments;
});

// Sesudah: setState dengan setTimeout
setComments(prev => {
  const updatedComments = [...prev, newComment];
  setTimeout(() => {
    onCommentsCountChange?.(updatedComments.length); // ✅ setState setelah render
  }, 0);
  return updatedComments;
});
```

## Verifikasi

Setelah migration selesai, cek:

1. **Tabel `post_comments`** harus memiliki kolom:
   - `author_avatar` (TEXT)
   - `author_name` (TEXT)
   - `author_username` (TEXT)

2. **Tabel `comment_likes`** harus ada dengan struktur:
   - `id` (UUID, Primary Key)
   - `comment_id` (UUID, Foreign Key)
   - `user_id` (UUID, Foreign Key)
   - `created_at` (TIMESTAMP)

3. **Function `add_comment`** harus ada

4. **Function `update_comment_likes_count`** harus ada

## Test Aplikasi

1. Buka http://localhost:5174/
2. Buka postingan yang ada komentar
3. Test fitur like komentar
4. Test buat komentar baru
5. **Verifikasi**: Tidak ada error di console
6. **Verifikasi**: Tidak ada React warning
7. **Verifikasi**: Fitur komentar dan like berfungsi

## Troubleshooting

### React Warning "setState during render"
- Sudah diperbaiki dengan setTimeout
- Refresh halaman aplikasi

### Error "Table comment_likes not found"
- Pastikan migration sudah dijalankan
- Cek apakah tabel comment_likes sudah dibuat

### Error "Column author_avatar does not exist"
- Pastikan migration sudah dijalankan
- Cek apakah kolom sudah ditambahkan ke post_comments

## Support

Jika masih ada masalah, cek:
1. Supabase Dashboard > SQL Editor
2. Supabase Dashboard > Table Editor
3. Browser Console untuk error details
4. Network tab untuk request/response
