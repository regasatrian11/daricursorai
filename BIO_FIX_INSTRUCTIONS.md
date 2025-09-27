# Instruksi Perbaikan Bio Database

## Masalah yang Ditemukan
- **Error**: `Could not find the 'bio' column of 'profiles' in the schema cache`
- **Penyebab**: Tabel `profiles` tidak memiliki kolom `bio`
- **Dampak**: Fitur edit bio tidak bisa menyimpan ke database

## Solusi

### Opsi 1: Jalankan Migration Manual (Recommended)

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/dsxiymksrubpryxggyow/sql
   - Klik "New Query"

2. **Jalankan SQL Migration**
   Copy dan paste kode berikut:

```sql
-- Add bio column to profiles table

-- 1. Add bio column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
        RAISE NOTICE '✅ Added bio column to profiles table';
    ELSE
        RAISE NOTICE '💡 Bio column already exists in profiles table';
    END IF;
END $$;

-- 2. Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column to profiles table';
    ELSE
        RAISE NOTICE '💡 updated_at column already exists in profiles table';
    END IF;
END $$;

-- 3. Create function to update user bio
CREATE OR REPLACE FUNCTION update_user_bio(new_bio TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get current user ID
    user_id := auth.uid();
    
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update or insert profile with bio
    INSERT INTO profiles (id, bio, updated_at)
    VALUES (user_id, new_bio, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        bio = EXCLUDED.bio,
        updated_at = EXCLUDED.updated_at;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get current user ID
    user_id := auth.uid();
    
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Return user profile
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.username,
        p.avatar_url,
        p.bio,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create RLS policies for profiles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles') THEN
        CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 6. Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create index on bio column for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_bio ON profiles(bio);

-- 8. Update existing profiles to have default bio if bio is null
UPDATE profiles 
SET bio = 'Welcome to my profile! I''m using Mikasa AI to explore the world of artificial intelligence.'
WHERE bio IS NULL;
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

Jika migration tidak bisa dijalankan, aplikasi akan otomatis menggunakan localStorage sebagai fallback. Fitur edit bio tetap berfungsi, hanya data disimpan di browser.

## Verifikasi

Setelah migration selesai, cek:

1. **Tabel `profiles`** harus memiliki kolom:
   - `bio` (TEXT)
   - `updated_at` (TIMESTAMP WITH TIME ZONE)

2. **Function `update_user_bio`** harus ada

3. **Function `get_user_profile`** harus ada

4. **RLS Policies** harus ada:
   - Users can view all profiles
   - Users can insert their own profile
   - Users can update their own profile

## Test Aplikasi

1. Buka http://localhost:5174/
2. Buka halaman Profile
3. Edit bio dengan teks baru
4. Simpan perubahan
5. **Verifikasi**: Tidak ada error di console
6. **Verifikasi**: Bio tersimpan dan tidak kembali ke teks lama
7. Refresh halaman
8. **Verifikasi**: Bio tetap tersimpan

## Troubleshooting

### Error "Column bio does not exist"
- Pastikan migration sudah dijalankan
- Refresh halaman aplikasi
- Clear browser cache

### Error "Function not found"
- Cek apakah function `update_user_bio` dan `get_user_profile` sudah dibuat
- Pastikan function memiliki SECURITY DEFINER

### Error "RLS Policy not found"
- Cek apakah RLS policies sudah dibuat
- Pastikan RLS sudah diaktifkan pada tabel profiles

## Support

Jika masih ada masalah, cek:
1. Supabase Dashboard > SQL Editor
2. Supabase Dashboard > Table Editor > profiles
3. Browser Console untuk error details
4. Network tab untuk request/response
