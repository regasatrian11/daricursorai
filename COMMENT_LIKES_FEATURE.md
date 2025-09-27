# Fitur Like Komentar

## Deskripsi
Fitur ini memungkinkan pengguna untuk menyukai komentar dan balasan komentar, dengan menampilkan jumlah like yang real-time.

## Fitur yang Ditambahkan

### 1. **Interface Comment**
- Menambahkan `likes_count?: number` - jumlah like
- Menambahkan `is_liked?: boolean` - status like user saat ini

### 2. **CommentsService**
- `likeComment(commentId, userId)` - like/unlike komentar
- `getCommentLikesCount(commentId)` - ambil jumlah like
- `isCommentLiked(commentId, userId)` - cek status like user
- `updateCommentLikesCount(commentId, change)` - update counter
- Fallback localStorage untuk mode demo

### 3. **UI Components**
- **InlineComments**: Tampilkan jumlah like di komentar inline
- **CommentsModal**: Tampilkan jumlah like di modal komentar
- Heart icon berubah warna saat di-like
- Counter real-time saat like/unlike

### 4. **Database Schema**
- Tabel `comment_likes` untuk menyimpan data like
- Kolom `likes_count` di tabel `post_comments`
- RLS policies untuk keamanan
- Function `update_comment_likes_count` untuk update counter

## Cara Kerja

### 1. **Like Komentar**
```javascript
// User klik tombol like
await commentsService.likeComment(commentId, userId);

// Update UI real-time
setComments(prev => prev.map(c => 
  c.id === commentId 
    ? { 
        ...c, 
        likes_count: (c.likes_count || 0) + 1,
        is_liked: true
      }
    : c
));
```

### 2. **Tampilan UI**
```jsx
<button onClick={() => handleLikeComment(comment.id)}>
  <Heart fill={comment.is_liked ? 'currentColor' : 'none'} />
  <span>Suka</span>
  {comment.likes_count > 0 && (
    <span>{comment.likes_count}</span>
  )}
</button>
```

### 3. **Database Operations**
- **Like**: Insert ke `comment_likes` + increment `likes_count`
- **Unlike**: Delete dari `comment_likes` + decrement `likes_count`
- **Count**: Query `comment_likes` untuk jumlah like

## Fallback Mode

### localStorage Fallback
Jika Supabase tidak tersedia, fitur like akan menggunakan localStorage:
- Data like disimpan di `mikasa_comment_likes_${commentId}`
- Counter diupdate di `mikasa_comments`
- Fungsi `likeCommentInLocalStorage()` menangani operasi

## Testing

### 1. **Test Like Komentar**
1. Buka aplikasi di http://localhost:5174/
2. Buka postingan yang ada komentar
3. Klik tombol "Suka" di komentar
4. Verifikasi:
   - Heart icon berubah warna merah
   - Counter bertambah
   - Data tersimpan di localStorage

### 2. **Test Unlike Komentar**
1. Klik tombol "Suka" lagi pada komentar yang sudah di-like
2. Verifikasi:
   - Heart icon kembali normal
   - Counter berkurang
   - Data terupdate di localStorage

### 3. **Test Real-time Update**
1. Like komentar di satu tab
2. Buka tab lain dengan komentar yang sama
3. Verifikasi counter terupdate

## Database Migration

Jalankan migration untuk membuat tabel dan function:
```sql
-- File: supabase/migrations/20250117000009_create_comment_likes_table.sql
```

## Error Handling

- **Network Error**: Fallback ke localStorage
- **Auth Error**: Skip operasi like
- **Database Error**: Log error dan fallback
- **Storage Error**: Cleanup dan retry

## Performance

- **Indexing**: Index pada `comment_id` dan `user_id`
- **Caching**: State management di React
- **Lazy Loading**: Load likes count saat dibutuhkan
- **Batch Updates**: Update multiple comments sekaligus

## Security

- **RLS Policies**: User hanya bisa like/unlike sendiri
- **Input Validation**: Validasi commentId dan userId
- **Rate Limiting**: Prevent spam like (future enhancement)
- **Data Integrity**: Unique constraint pada (comment_id, user_id)

## Future Enhancements

1. **Like Notifications**: Notify user saat komentar di-like
2. **Like Analytics**: Track popular comments
3. **Like History**: Show who liked the comment
4. **Bulk Operations**: Like multiple comments
5. **Like Animations**: Smooth transition effects
