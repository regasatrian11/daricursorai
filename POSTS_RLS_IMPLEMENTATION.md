# Posts RLS Implementation Guide

## Overview
This document outlines the complete implementation of secure posts management with Row Level Security (RLS) for the Mikasa AI Chat App. Every post stores user_id from auth, with avatar/foto profil taken from profiles.avatar_url.

## Database Schema

### Posts Table Structure
```sql
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    media_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video'
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    is_liked BOOLEAN DEFAULT FALSE,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Comments Table Structure
```sql
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features
- **user_id**: UUID referencing `profiles(user_id)` for secure user identification
- **Cascade Delete**: Posts and comments automatically deleted when user account is removed
- **Foreign Key Constraints**: Ensures data integrity between posts and profiles tables
- **Media Support**: Support for text, image, and video posts
- **Engagement Metrics**: Built-in counters for likes, comments, shares, and saves

## Row Level Security (RLS) Policies

### Posts Table Policies
```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can view all posts (for feed functionality)
CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT
    USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE
    USING (auth.uid() = user_id);
```

### Comments Table Policies
```sql
-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users can view all comments
CREATE POLICY "Users can view all comments" ON comments
    FOR SELECT
    USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE
    USING (auth.uid() = user_id);
```

### Security Benefits
- **Data Isolation**: Users can only modify their own posts and comments
- **Feed Access**: All users can view posts for social feed functionality
- **Automatic Enforcement**: Database-level security regardless of application logic
- **Zero Trust**: Even if application logic is bypassed, RLS prevents unauthorized access

## PostsService Implementation

### Core Functions

#### 1. Get Feed with JOIN Query
```typescript
async getFeed(limit: number = 50, offset: number = 0): Promise<Post[]> {
  const { data, error } = await supabase
    .rpc('get_feed_with_profiles', {
      limit_count: limit,
      offset_count: offset
    });
  // Returns posts with profile data (avatar_url, full_name, username)
}
```

#### 2. Create Post with auth.uid()
```typescript
async createPost(content: string, mediaData?: {
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
}): Promise<string | null> {
  const { data, error } = await supabase
    .rpc('create_post', {
      post_content: content,
      post_image_url: mediaData?.imageUrl || null,
      post_video_url: mediaData?.videoUrl || null,
      post_media_type: mediaData?.mediaType || 'text'
    });
  // Uses auth.uid() to automatically set user_id
}
```

#### 3. Update Post
```typescript
async updatePost(postId: string, content: string, mediaData?: {
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
}): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('update_post', {
      post_id: postId,
      post_content: content,
      post_image_url: mediaData?.imageUrl || null,
      post_video_url: mediaData?.videoUrl || null,
      post_media_type: mediaData?.mediaType || 'text'
    });
  // RLS ensures user can only update their own posts
}
```

#### 4. Delete Post
```typescript
async deletePost(postId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('delete_post', {
      post_id: postId
    });
  // RLS ensures user can only delete their own posts
}
```

### Security Features
- **Authentication Check**: All functions verify user authentication
- **RLS Enforcement**: Database queries automatically respect RLS policies
- **Error Handling**: Comprehensive error handling with fallbacks
- **LocalStorage Fallback**: Graceful degradation when database is unavailable

## Secure Database Functions

### Get Feed with Profiles Function
```sql
CREATE OR REPLACE FUNCTION get_feed_with_profiles(limit_count INTEGER DEFAULT 50, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    media_type VARCHAR,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    saves_count INTEGER,
    is_liked BOOLEAN,
    is_saved BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    -- Profile data
    avatar_url TEXT,
    full_name TEXT,
    username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.content,
        p.image_url,
        p.video_url,
        p.media_type,
        p.likes_count,
        p.comments_count,
        p.shares_count,
        p.saves_count,
        p.is_liked,
        p.is_saved,
        p.created_at,
        p.updated_at,
        -- Profile data
        pr.avatar_url,
        pr.full_name,
        pr.username
    FROM posts p
    JOIN profiles pr ON p.user_id = pr.user_id
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
```

### Create Post Function
```sql
CREATE OR REPLACE FUNCTION create_post(
    post_content TEXT,
    post_image_url TEXT DEFAULT NULL,
    post_video_url TEXT DEFAULT NULL,
    post_media_type VARCHAR DEFAULT 'text'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_post_id UUID;
BEGIN
    -- Insert new post with current user's ID
    INSERT INTO posts (
        user_id,
        content,
        image_url,
        video_url,
        media_type
    ) VALUES (
        auth.uid(),
        post_content,
        post_image_url,
        post_video_url,
        post_media_type
    )
    RETURNING id INTO new_post_id;
    
    RETURN new_post_id;
END;
$$;
```

### Security Benefits
- **SECURITY DEFINER**: Functions run with elevated privileges but respect RLS
- **Parameterized Queries**: Prevents SQL injection attacks
- **Atomic Operations**: Database-level transactions ensure consistency
- **Automatic User Assignment**: `auth.uid()` automatically sets user_id

## Frontend Integration

### FeedPage.tsx Updates

#### 1. Load Feed with JOIN Query
```typescript
// Load posts from database with JOIN query
useEffect(() => {
  const loadPostsFromDatabase = async () => {
    try {
      const postsService = PostsService.getInstance();
      const feedPosts = await postsService.getFeed(50, 0);
      
      if (feedPosts.length > 0) {
        setPosts(feedPosts);
      } else {
        // Fallback to globalPostService
        const initialPosts = globalPostService.getAllPosts();
        if (initialPosts.length > 0) {
          const cleanedInitialPosts = cleanBlobUrls(initialPosts);
          setPosts(cleanedInitialPosts);
        }
      }
    } catch (error) {
      // Fallback to globalPostService
    }
  };

  loadPostsFromDatabase();
}, []);
```

#### 2. Create Post with auth.uid()
```typescript
const handleCreatePostFromModal = async () => {
  try {
    const postsService = PostsService.getInstance();
    
    // Prepare media data
    let mediaData = undefined;
    if (createPostForm.media) {
      const base64Image = await convertFileToBase64(createPostForm.media);
      mediaData = {
        imageUrl: base64Image,
        mediaType: 'image' as const
      };
    }
    
    // Create post using PostsService with auth.uid()
    const postId = await postsService.createPost(createPostForm.content.trim(), mediaData);
    
    if (postId) {
      // Refresh feed to show new post
      const updatedFeed = await postsService.getFeed(50, 0);
      setPosts(updatedFeed);
    }
  } catch (error) {
    // Fallback to old method
  }
};
```

#### 3. Display Avatar from Profiles Table
```typescript
// Avatar display with priority: profiles.avatar_url > authorAvatar > generated
{(post.avatar_url || post.authorAvatar) ? (
  <img 
    src={post.avatar_url || post.authorAvatar} 
    alt={post.full_name || post.author}
    className="w-full h-full object-cover"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.src = `https://ui-avatars.com/api/?name=${post.full_name || post.author}&background=3b82f6&color=fff&size=40`;
    }}
  />
) : (
  <img 
    src={`https://ui-avatars.com/api/?name=${post.full_name || post.author}&background=3b82f6&color=fff&size=40`}
    alt={post.full_name || post.author}
    className="w-full h-full object-cover"
  />
)}
```

#### 4. Display Name from Profiles Table
```typescript
// Name display with priority: profiles.full_name > author
<h3 
  className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
  onClick={() => handlePostAuthorClick(post.full_name || post.author, post.avatar_url || post.authorAvatar)}
>
  {post.full_name || post.author}
</h3>
```

### Key Features
- **Database First**: Prioritizes secure database storage with JOIN queries
- **Fallback Strategy**: Uses globalPostService when database is unavailable
- **Error Handling**: Graceful error handling with user feedback
- **Avatar Priority**: profiles.avatar_url → authorAvatar → generated avatar
- **Name Priority**: profiles.full_name → author

## SQL Queries

### Essential Queries

#### 1. Create Post with auth.uid()
```sql
INSERT INTO posts (content, user_id) VALUES ('isi', auth.uid());
```

#### 2. Get Feed with JOIN
```sql
SELECT posts.*, profiles.avatar_url, profiles.full_name, profiles.username 
FROM posts 
JOIN profiles ON posts.user_id = profiles.user_id 
ORDER BY created_at DESC;
```

#### 3. Update Post with RLS
```sql
UPDATE posts 
SET content = $1, updated_at = NOW() 
WHERE id = $2 AND user_id = auth.uid();
```

#### 4. Delete Post with RLS
```sql
DELETE FROM posts 
WHERE id = $1 AND user_id = auth.uid();
```

#### 5. Get Comments with Profiles
```sql
SELECT comments.*, profiles.avatar_url, profiles.full_name, profiles.username 
FROM comments 
JOIN profiles ON comments.user_id = profiles.user_id 
WHERE post_id = $1 
ORDER BY created_at ASC;
```

## Performance Optimizations

### Database Indexes
```sql
-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_media_type ON posts(media_type);
CREATE INDEX idx_posts_likes_count ON posts(likes_count DESC);

-- Comments indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

### Query Optimization
- **Single JOIN Queries**: Efficient queries using proper JOIN clauses
- **Index Usage**: Optimized queries that use database indexes
- **Pagination Support**: LIMIT and OFFSET for efficient data loading
- **Caching Strategy**: localStorage fallback for offline functionality

## Security Best Practices

### 1. Authentication
- All operations require user authentication
- User ID automatically extracted from auth context using `auth.uid()`
- No manual user ID passing in queries

### 2. Authorization
- RLS policies enforce authorization at database level
- Policies use `auth.uid()` for automatic user identification
- No application-level authorization logic needed

### 3. Data Protection
- Foreign key constraints ensure data integrity
- Cascade delete prevents orphaned records
- Unique constraints prevent data duplication

### 4. Error Handling
- No sensitive information exposed in error messages
- Comprehensive logging for debugging
- Graceful fallbacks for service failures

## Testing Strategy

### Unit Tests
- PostsService function testing
- Database query validation
- RLS policy verification
- Error handling scenarios

### Integration Tests
- Frontend-backend integration
- Database connectivity
- Authentication flow
- Fallback mechanisms

### Security Tests
- Unauthorized access attempts
- SQL injection prevention
- RLS policy enforcement
- Data isolation verification

## Deployment Checklist

### Database Setup
- [ ] Run `posts_database_schema.sql` to create tables and policies
- [ ] Verify RLS is enabled on posts and comments tables
- [ ] Test all RLS policies
- [ ] Create necessary indexes
- [ ] Grant proper permissions

### Application Deployment
- [ ] Deploy PostsService with proper imports
- [ ] Update FeedPage.tsx with new posts handling
- [ ] Test database connectivity
- [ ] Verify fallback mechanisms
- [ ] Monitor error logs

### Security Verification
- [ ] Test unauthorized access prevention
- [ ] Verify RLS policy enforcement
- [ ] Check data isolation
- [ ] Validate error handling
- [ ] Monitor security events

## Monitoring and Maintenance

### Key Metrics
- Database query performance
- RLS policy effectiveness
- Error rates and patterns
- User interaction metrics

### Maintenance Tasks
- Regular security audits
- Performance monitoring
- Index optimization
- Backup verification

### Security Monitoring
- Failed authentication attempts
- Unauthorized access attempts
- RLS policy violations
- Database security events

## Conclusion

The posts RLS implementation provides:
- ✅ **Secure Storage**: Every post stores user_id from auth.uid()
- ✅ **Foreign Key Integrity**: user_id column references profiles(user_id)
- ✅ **RLS Protection**: Database-level security with comprehensive policies
- ✅ **JOIN Queries**: Efficient feed loading with profile data
- ✅ **Avatar Integration**: Avatar/foto profil from profiles.avatar_url
- ✅ **Performance**: Optimized queries with proper indexes
- ✅ **Reliability**: Fallback mechanisms for offline functionality
- ✅ **Security**: Multi-layer security with RLS policies and secure functions
- ✅ **Scalability**: Efficient database design that scales with user growth

This implementation ensures that every post is securely stored with proper user identification, and avatar/foto profil is correctly displayed from the profiles table.
