# Comments Fallback Solution

## Masalah yang Ditemukan

Error 404 saat RPC function `get_post_comments_with_profiles` tidak ditemukan karena migration belum dijalankan:

```
POST https://dsxiymksrubpryxggyow.supabase.co/rest/v1/rpc/get_post_comments_with_profiles 404 (Not Found)
{code: 'PGRST202', details: 'Searched for the function public.get_post_comments…r, but no matches were found in the schema cache.', hint: 'Perhaps you meant to call the function public.get_feed_with_profiles', message: 'Could not find the function public.get_post_commen…unt, offset_count, post_uuid) in the schema cache'}
```

## Solusi Fallback yang Diterapkan

### 1. **Robust Error Handling dengan Fallback Strategy**

#### A. getPostComments Function
```typescript
async getPostComments(postId: string, limit: number = 50, offset: number = 0): Promise<Comment[]> {
  try {
    console.log('💬 Fetching post comments:', postId);

    // Try RPC function first
    try {
      const { data, error } = await supabase
        .rpc('get_post_comments_with_profiles', {
          post_uuid: postId,
          limit_count: limit,
          offset_count: offset
        });

      if (error) {
        console.warn('⚠️ RPC function failed, trying direct query:', error);
        throw error;
      }

      // Transform data with profile information
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

      console.log(`✅ Comments fetched via RPC: ${transformedData?.length || 0} comments`);
      return transformedData;
    } catch (rpcError) {
      console.warn('⚠️ RPC function not available, trying direct query:', rpcError);
      
      // Fallback to direct query without profile join
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          likes_count,
          parent_comment_id,
          created_at,
          updated_at
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching comments:', error);
        return [];
      }

      // Transform data with default author info
      const transformedData = (data || []).map(comment => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        author_name: 'Anonymous',
        author_username: 'user',
        author_avatar: `https://ui-avatars.com/api/?name=Anonymous&background=3b82f6&color=fff&size=32`,
        content: comment.content,
        likes_count: comment.likes_count || 0,
        parent_comment_id: comment.parent_comment_id || null,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        timestamp: comment.created_at
      }));

      console.log(`✅ Comments fetched via direct query: ${transformedData?.length || 0} comments`);
      return transformedData;
    }
  } catch (error) {
    console.error('❌ Exception fetching comments:', error);
    return [];
  }
}
```

#### B. createComment Function
```typescript
async createComment(postId: string, content: string): Promise<string | null> {
  try {
    console.log('💬 Creating comment...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user');
      return null;
    }

    // Try RPC function first
    try {
      const { data, error } = await supabase
        .rpc('create_comment', {
          post_uuid: postId,
          comment_content: content
        });

      if (error) {
        console.warn('⚠️ RPC function failed, trying direct insert:', error);
        throw error;
      }

      console.log('✅ Comment created successfully via RPC:', data);
      return data;
    } catch (rpcError) {
      console.warn('⚠️ RPC function not available, trying direct insert:', rpcError);
      
      // Fallback to direct insert
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error creating comment:', error);
        return null;
      }

      console.log('✅ Comment created successfully via direct insert:', data.id);
      return data.id;
    }
  } catch (error) {
    console.error('❌ Exception creating comment:', error);
    return null;
  }
}
```

### 2. **Fallback Strategy Details**

#### A. Primary Method (RPC Functions)
- **get_post_comments_with_profiles**: Fetch comments dengan profile information
- **create_comment**: Create comment dengan profile resolution
- **Benefits**: Full profile data, optimized queries, better security

#### B. Fallback Method (Direct Queries)
- **Direct SELECT**: Query `post_comments` table langsung
- **Direct INSERT**: Insert ke `post_comments` table langsung
- **Benefits**: Works even without RPC functions, basic functionality

### 3. **Data Transformation**

#### A. RPC Function Response
```typescript
// Full profile data from RPC function
{
  id: comment.id,
  author_name: comment.author_name || 'Unknown User',
  author_username: comment.author_username || 'user',
  author_avatar: comment.author_avatar || null,
  content: comment.content,
  // ... other fields
}
```

#### B. Direct Query Response
```typescript
// Default author info for direct query
{
  id: comment.id,
  author_name: 'Anonymous',
  author_username: 'user',
  author_avatar: `https://ui-avatars.com/api/?name=Anonymous&background=3b82f6&color=fff&size=32`,
  content: comment.content,
  // ... other fields
}
```

## Hasil Perbaikan

### ✅ **Masalah yang Diperbaiki:**

1. **404 Error**: Comments sekarang dapat di-fetch meskipun RPC function tidak ada
2. **Graceful Degradation**: Aplikasi tetap berfungsi dengan fallback method
3. **Error Handling**: Robust error handling dengan multiple fallback levels
4. **User Experience**: Users tetap dapat melihat dan membuat comments

### 🎯 **Cara Kerja Sekarang:**

#### **Scenario 1: RPC Functions Available**
1. Try RPC function `get_post_comments_with_profiles`
2. Get comments dengan full profile data
3. Return formatted data dengan author information

#### **Scenario 2: RPC Functions Not Available**
1. RPC function fails (404 error)
2. Fallback to direct query `post_comments` table
3. Get comments dengan default author info
4. Return formatted data dengan basic information

#### **Scenario 3: Both Methods Fail**
1. Both RPC and direct query fail
2. Return empty array
3. Log error untuk debugging

### 📱 **User Experience:**

1. **Comment Loading**: Comments load meskipun RPC function tidak ada
2. **Comment Creation**: Users dapat membuat comment
3. **Author Information**: 
   - **With RPC**: Full profile data (name, username, avatar)
   - **Without RPC**: Default "Anonymous" user
4. **Graceful Degradation**: Aplikasi tetap berfungsi dengan fitur terbatas

### 🔧 **Technical Details:**

#### **Error Handling Strategy:**
```
1. Try RPC function (preferred)
   ↓ (if fails)
2. Try direct query (fallback)
   ↓ (if fails)
3. Return empty array (graceful failure)
```

#### **Logging Strategy:**
- **Success**: Log method used (RPC vs direct)
- **Warning**: Log fallback attempts
- **Error**: Log final failures

#### **Data Consistency:**
- **RPC Method**: Full profile data
- **Direct Method**: Default author info
- **Interface**: Consistent Comment interface

## File yang Dimodifikasi

- `src/services/postsService.ts`

## Catatan

- Fallback solution memastikan aplikasi tetap berfungsi
- RPC functions tetap preferred method untuk performance
- Direct queries sebagai backup untuk compatibility
- Error handling robust untuk semua skenario

Sekarang comments dapat di-fetch dan dibuat meskipun RPC functions belum tersedia! 🚀
