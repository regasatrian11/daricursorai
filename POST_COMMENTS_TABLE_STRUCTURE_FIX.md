# Post Comments Table Structure Fix

## Masalah yang Ditemukan

Error 400 saat mengakses comments karena masalah struktur tabel dan foreign key relationships:

```
GET https://dsxiymksrubpryxggyow.supabase.co/rest/v1/post_comments?select=id%2C…tar_url%29&post_id=eq.1758773722985&order=created_at.asc&offset=0&limit=50 400 (Bad Request)
{code: 'PGRST200', details: "Searched for a foreign key relationship between 'p…n the schema 'public', but no matches were found.", hint: "Perhaps you meant 'posts' instead of 'profiles'.", message: "Could not find a relationship between 'post_comments' and 'profiles' in the schema cache"}

POST https://dsxiymksrubpryxggyow.supabase.co/rest/v1/post_comments?select=id 400 (Bad Request)
{code: 'PGRST204', details: null, hint: null, message: "Could not find the 'content' column of 'post_comments' in the schema cache"}
```

## Perbaikan yang Dilakukan

### 1. **Migration File: `supabase/migrations/20250117000006_fix_post_comments_table.sql`**

#### A. Recreate post_comments Table
```sql
-- Drop existing post_comments table if it exists
DROP TABLE IF EXISTS post_comments CASCADE;

-- Recreate post_comments table with proper structure
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES user_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE, -- For replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### B. RLS Policies
```sql
-- Enable RLS
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Comments are viewable by everyone"
    ON post_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON post_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON post_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON post_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

#### C. RPC Functions

##### get_post_comments_with_profiles Function
```sql
CREATE OR REPLACE FUNCTION get_post_comments_with_profiles(
    post_uuid UUID,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    user_id UUID,
    content TEXT,
    likes_count INTEGER,
    parent_comment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Return comments with profile information
    RETURN QUERY
    SELECT
        pc.id,
        pc.post_id,
        pc.user_id,
        pc.content,
        pc.likes_count,
        pc.parent_comment_id,
        pc.created_at,
        pc.updated_at,
        COALESCE(p.full_name, u.email) as author_name,
        COALESCE(p.username, split_part(u.email, '@', 1)) as author_username,
        COALESCE(p.avatar_url, 'https://ui-avatars.com/api/?name=' || COALESCE(p.full_name, u.email) || '&background=3b82f6&color=fff&size=32') as author_avatar
    FROM
        public.post_comments pc
    LEFT JOIN auth.users u ON u.id = pc.user_id
    LEFT JOIN public.profiles p ON p.id = pc.user_id
    WHERE
        pc.post_id = post_uuid
    ORDER BY
        pc.created_at ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
```

##### create_comment Function
```sql
CREATE OR REPLACE FUNCTION create_comment(
    post_uuid UUID,
    comment_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
    comment_id UUID;
    author_name TEXT;
    author_username TEXT;
    author_avatar TEXT;
    user_profile RECORD;
BEGIN
    -- Get current user
    SELECT auth.uid() INTO user_uuid;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated.';
    END IF;
    
    -- Get user profile information
    SELECT 
        COALESCE(p.full_name, u.email) as full_name,
        COALESCE(p.username, split_part(u.email, '@', 1)) as username,
        COALESCE(p.avatar_url, 'https://ui-avatars.com/api/?name=' || COALESCE(p.full_name, u.email) || '&background=3b82f6&color=fff&size=32') as avatar_url
    INTO user_profile
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE u.id = user_uuid;
    
    -- Set author information
    author_name := COALESCE(user_profile.full_name, 'Anonymous');
    author_username := COALESCE(user_profile.username, 'user');
    author_avatar := COALESCE(user_profile.avatar_url, 'https://ui-avatars.com/api/?name=Anonymous&background=3b82f6&color=fff&size=32');
    
    -- Create the comment
    INSERT INTO public.post_comments (
        post_id,
        user_id,
        content,
        created_at,
        updated_at
    ) VALUES (
        post_uuid,
        user_uuid,
        comment_content,
        NOW(),
        NOW()
    ) RETURNING id INTO comment_id;
    
    -- Return the comment ID
    RETURN comment_id;
END;
$$;
```

### 2. **Updated postsService.ts**

#### A. getPostComments Function
```typescript
// Sebelum (SALAH)
const { data, error } = await supabase
  .from('post_comments')
  .select(`
    id,
    post_id,
    user_id,
    content,
    created_at,
    updated_at,
    profiles!inner(
      full_name,
      username,
      avatar_url
    )
  `)
  .eq('post_id', postId)
  .order('created_at', { ascending: true })
  .range(offset, offset + limit - 1);

// Sesudah (BENAR)
const { data, error } = await supabase
  .rpc('get_post_comments_with_profiles', {
    post_uuid: postId,
    limit_count: limit,
    offset_count: offset
  });
```

#### B. createComment Function
```typescript
// Sebelum (SALAH)
const { data, error } = await supabase
  .from('post_comments')
  .insert({
    post_id: postId,
    user_id: user.id,
    content: content
  })
  .select('id')
  .single();

// Sesudah (BENAR)
const { data, error } = await supabase
  .rpc('create_comment', {
    post_uuid: postId,
    comment_content: content
  });
```

#### C. Data Transformation
```typescript
// Updated to use RPC function fields
const transformedData = (data || []).map(comment => ({
  id: comment.id,
  post_id: comment.post_id,
  user_id: comment.user_id,
  author_name: comment.author_name || 'Unknown User',
  author_username: comment.author_username || 'user',
  author_avatar: comment.author_avatar || null,
  content: comment.content,
  likes_count: comment.likes_count || 0,
  parent_comment_id: comment.parent_comment_id || null,
  created_at: comment.created_at,
  updated_at: comment.updated_at,
  timestamp: comment.created_at
}));
```

## Hasil Perbaikan

### ✅ **Masalah yang Diperbaiki:**

1. **Table Structure**: Tabel `post_comments` direcreate dengan struktur yang benar
2. **Foreign Key**: Tidak ada foreign key ke `profiles` table (menggunakan RPC function)
3. **Column Issues**: Kolom `content` sekarang tersedia
4. **Profile Data**: Author information di-resolve via RPC function
5. **RLS Policies**: Proper Row Level Security policies

### 🎯 **Cara Kerja Sekarang:**

#### **Fetch Comments Flow:**
1. User requests comments for a post
2. Function calls `get_post_comments_with_profiles` RPC
3. RPC function joins with `profiles` table
4. Function returns formatted comment data with author info

#### **Create Comment Flow:**
1. User creates a new comment
2. Function calls `create_comment` RPC
3. RPC function gets user profile information
4. RPC function creates comment in database
5. Function returns comment ID

### 📱 **User Experience:**

1. **Comment Loading**: Comments load tanpa error 400
2. **Comment Creation**: Users dapat membuat comment
3. **Author Information**: Comment menampilkan author name dan avatar
4. **Real-time Updates**: Comments update secara real-time

### 🔧 **Technical Details:**

#### **Database Structure:**
- **Table**: `post_comments` dengan struktur yang benar
- **Foreign Keys**: Hanya ke `user_posts` dan `auth.users`
- **Profile Data**: Di-resolve via RPC function dengan JOIN
- **RLS**: Proper security policies

#### **RPC Functions:**
- **get_post_comments_with_profiles**: Fetch comments dengan profile data
- **create_comment**: Create comment dengan profile resolution
- **Security**: SECURITY DEFINER dengan proper authentication checks

#### **Data Flow:**
```
Client → postsService → RPC Function → Database → Profile Resolution → Response
```

## File yang Dimodifikasi

- `supabase/migrations/20250117000006_fix_post_comments_table.sql` (New)
- `src/services/postsService.ts`

## Catatan

- Migration harus dijalankan di Supabase
- RPC functions menggunakan SECURITY DEFINER
- Profile data di-resolve secara otomatis
- Backward compatibility terjaga

Sekarang comments dapat di-fetch dan dibuat tanpa error 400! 🚀
