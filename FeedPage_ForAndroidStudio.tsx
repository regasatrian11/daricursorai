import { useState, useEffect, memo } from 'react';
import { Heart, MessageCircle, Share2, Trash2, Bookmark, Bell, Image, Video, Smile, X, Search, Plus } from 'lucide-react';
import { NavigationTab } from '../types/navigation';
import { Post, Comment } from '../types/post';
import BottomNavigation from './BottomNavigation';
import postStorageService from '../services/postStorageService';
import globalPostService from '../services/globalPostService';
import globalProfileService from '../services/globalProfileService';
import DataRecoveryService from '../services/dataRecoveryService';
import { UserAuthService, UserPostService } from '../data/users';

// Helper function to convert File to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to clean blob URLs from data (but preserve authorAvatar)
const cleanBlobUrls = (data: any): any => {
  if (typeof data === 'string' && data.startsWith('blob:')) {
    return null; // Remove blob URLs
  }
  if (Array.isArray(data)) {
    return data.map(cleanBlobUrls).filter(item => item !== null);
  }
  if (data && typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Preserve authorAvatar even if it's a blob URL
      if (key === 'authorAvatar' && typeof value === 'string' && value.startsWith('blob:')) {
        cleaned[key] = value;
      } else {
        cleaned[key] = cleanBlobUrls(value);
      }
    }
    return cleaned;
  }
  return data;
};

interface FeedPageProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isDemoUser?: boolean;
  onViewUserProfile?: (userId: string, userName: string) => void;
  onStartChat?: (userId: string, userName: string) => void;
}

const FeedPage = memo(function FeedPage({ activeTab, onTabChange, isDemoUser = false, onViewUserProfile, onStartChat }: FeedPageProps) {
  // ID pengguna saat ini (untuk demo, kita gunakan 'current-user')
  const currentUserId = 'current-user';
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  
  // Get subscription status for Meta Verified system
  const isPremium = false;
  const isPro = false;
  
  // List of verified accounts (celebrities, influencers, famous people - not based on payment)
  const verifiedAccounts = [
    'Mikasa AI',
    'Tech Enthusiast', 
    'AI Lover',
    'Developer Pro',
    'Celebrity User',
    'Famous Influencer',
    'Verified Artist'
  ];
  
  // Debug info
  console.log('FeedPage - isDemoUser:', isDemoUser);
  console.log('FeedPage - currentUserId:', currentUserId);
  
  // Load user data and posts on mount using DataRecoveryService
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🔄 FeedPage - Loading user data using DataRecoveryService...');
        
        const dataRecoveryService = DataRecoveryService.getInstance();
        const recoveredData = dataRecoveryService.recoverAllData({ logDetails: false });
        
        // Load posts from multiple sources
        let allPosts: Post[] = [];
        
        // 1. Global posts (primary source)
        const globalPosts = globalPostService.getAllPosts();
        if (globalPosts.length > 0) {
          allPosts = [...globalPosts];
          console.log('✅ FeedPage - Loaded global posts:', globalPosts.length);
        }
        
        // 2. Recovered posts from localStorage (fallback)
        if (recoveredData.posts && recoveredData.posts.length > 0) {
          // Merge without duplicates
          const existingIds = new Set(allPosts.map(p => p.id));
          const newRecoveredPosts = recoveredData.posts.filter(p => !existingIds.has(p.id));
          allPosts = [...allPosts, ...newRecoveredPosts];
          console.log('✅ FeedPage - Loaded recovered posts:', newRecoveredPosts.length);
        }
        
        // 3. Set posts to state and clean blob URLs
        if (allPosts.length > 0) {
          console.log('🔍 FeedPage - Posts before cleaning:', allPosts.map(p => ({
            id: p.id,
            author: p.author,
            authorAvatar: p.authorAvatar,
            hasAuthorAvatar: !!p.authorAvatar
          })));
          
          const cleanedPosts = cleanBlobUrls(allPosts);
          
          console.log('🔍 FeedPage - Posts after cleaning:', cleanedPosts.map(p => ({
            id: p.id,
            author: p.author,
            authorAvatar: p.authorAvatar,
            hasAuthorAvatar: !!p.authorAvatar
          })));
          
          setPosts(cleanedPosts);
          console.log('✅ FeedPage - Total posts loaded:', cleanedPosts.length);
        } else {
          console.log('📝 FeedPage - No posts found, using default posts');
        }
        
        // Check storage health
        const storageHealth = dataRecoveryService.checkStorageHealth();
        if (!storageHealth.isHealthy) {
          console.warn('⚠️ FeedPage - Storage health issues detected');
          dataRecoveryService.cleanupStorage();
        }
        
      } catch (error) {
        console.error('❌ FeedPage - Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);
  
  // Default posts
  const defaultPosts: Post[] = [
    {
      id: '1',
      author: 'Tech Enthusiast',
      author_name: 'Tech Enthusiast',
      author_username: 'techguru',
      authorAvatar: 'https://ui-avatars.com/api/?name=Tech+Enthusiast&background=3b82f6&color=fff&size=40',
      content: 'Excited to share my latest project using React and TypeScript! The development experience has been amazing. 🚀',
      images: [],
      likes: 24,
      comments: 8,
      shares: 3,
      saves: 12,
      isLiked: false,
      isSaved: false,
      timestamp: '2 jam lalu',
      userId: 'user-tech',
      isOwnPost: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      author: 'AI Lover',
      author_name: 'AI Lover',
      author_username: 'ailover',
      authorAvatar: 'https://ui-avatars.com/api/?name=AI+Lover&background=8b5cf6&color=fff&size=40',
      content: 'Just discovered this amazing AI chatbot! The conversations feel so natural and engaging. Perfect for learning new topics! 🤖✨',
      images: [],
      likes: 45,
      comments: 12,
      shares: 7,
      saves: 18,
      isLiked: true,
      isSaved: false,
      timestamp: '4 jam lalu',
      userId: 'user-ai',
      isOwnPost: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];

  // State untuk posts
  const [posts, setPosts] = useState<Post[]>(defaultPosts);
  const [globalProfileData, setGlobalProfileData] = useState<any>(null);

  // Subscribe to global profile changes
  useEffect(() => {
    const unsubscribe = globalProfileService.subscribe((profileData) => {
      console.log('🔄 FeedPage - Received global profile update:', profileData);
      setGlobalProfileData(profileData);
    });

    // Load initial profile data
    const currentProfile = globalProfileService.getCurrentProfile();
    if (currentProfile) {
      console.log('📋 FeedPage - Initial profile data:', currentProfile);
      setGlobalProfileData(currentProfile);
    } else {
      // Load from localStorage as fallback
      const savedUser = localStorage.getItem('mikasa_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('📋 FeedPage - Fallback user data from localStorage:', userData);
          setGlobalProfileData(userData);
      } catch (error) {
          console.error('❌ FeedPage - Error parsing saved user:', error);
      }
      }
    }
    
    return unsubscribe;
  }, []);

  // Subscribe to global post changes
  useEffect(() => {
    const unsubscribe = globalPostService.subscribe((updatedPosts) => {
      console.log('🔄 FeedPage - Received global post update:', updatedPosts);
      const cleanedPosts = cleanBlobUrls(updatedPosts);
      setPosts(cleanedPosts);
    });

    // Load initial posts and clean blob URLs
    const initialPosts = globalPostService.getAllPosts();
    if (initialPosts.length > 0) {
      console.log('📋 FeedPage - Initial posts from globalPostService:', initialPosts);
      const cleanedInitialPosts = cleanBlobUrls(initialPosts);
      setPosts(cleanedInitialPosts);
    }

    return unsubscribe;
  }, []);

  // States for modals and forms
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Create post form state
  const [createPostForm, setCreatePostForm] = useState({
    content: '',
    type: 'text' as 'text' | 'photo' | 'video',
    media: null as File | null
  });

  // Search functions
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filteredPosts = posts.filter(post => {
      // Search by content
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      
      // Search by author name
      const authorMatch = post.author.toLowerCase().includes(searchLower);
      
      // Search by author username (if available)
      const usernameMatch = post.author_name?.toLowerCase().includes(searchLower);
      
      return contentMatch || authorMatch || usernameMatch;
    });

    setSearchResults(filteredPosts);
    setShowSearchModal(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Real-time search
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      
      // Search posts
      const filteredPosts = posts.filter(post => {
        const contentMatch = post.content.toLowerCase().includes(searchLower);
        const authorMatch = post.author.toLowerCase().includes(searchLower);
        const usernameMatch = post.author_name?.toLowerCase().includes(searchLower);
        return contentMatch || authorMatch || usernameMatch;
      });
      setSearchResults(filteredPosts);
      
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  const handlePostAuthorClick = (author: string, authorAvatar?: string) => {
    console.log('👤 Post author clicked:', author);
    // Close search modal
    setShowSearchModal(false);
    setSearchQuery('');
    
    // Navigate to user profile
    if (onViewUserProfile) {
      // Generate a simple userId from author name for demo purposes
      const userId = author.toLowerCase().replace(/\s+/g, '-');
      onViewUserProfile(userId, author);
    } else {
      // Fallback: show profile info
      alert(`Profil ${author}\n\nAvatar: ${authorAvatar ? 'Tersedia' : 'Default'}\n\nIni adalah profil pengguna yang membuat postingan.`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Get posts to display (search results or all posts)
  const displayPosts = searchResults.length > 0 ? searchResults : posts;

  // Handle functions
  const handleLike = (postId: string) => {
    globalPostService.likePost(postId, currentUserId);
  };

  const handleSave = (postId: string) => {
    globalPostService.savePost(postId, currentUserId);
  };

  const handleShare = (post: Post) => {
    setSelectedPost(post);
    setShowShareModal(true);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      try {
        // Remove from global posts
        globalPostService.removePost(postId);
        
        // Remove from local posts
        setPosts(prev => prev.filter(post => post.id !== postId));
        
        console.log('✅ Post deleted:', postId);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error('❌ Error deleting post:', error);
        alert('Gagal menghapus postingan');
      }
    }
  };

  const handleComment = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleAddComment = () => {
    if (!selectedPost || !newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: globalProfileData?.name || 'Anonymous',
      authorAvatar: globalProfileData?.profileImage || `https://ui-avatars.com/api/?name=${globalProfileData?.name || 'Anonymous'}&background=3b82f6&color=fff&size=32`,
      content: newComment,
      timestamp: 'Baru saja',
      replies: []
    };

    globalPostService.addComment(selectedPost.id, comment);
    setNewComment('');
    setShowCommentModal(false);
  };

  const handleCreatePost = () => {
    if (!newPost.trim() && selectedImages.length === 0) return;

    // Get user data from localStorage to ensure consistency
    const savedUser = localStorage.getItem('mikasa_user');
    let userData = null;
    if (savedUser) {
      try {
        userData = JSON.parse(savedUser);
        console.log('📋 Using saved user data for post:', userData);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
      }
    }

    // Use global profile data or fallback to saved user data
    const authorName = globalProfileData?.name || userData?.name || 'Anonymous';
    const authorAvatar = globalProfileData?.profileImage || userData?.profileImage || `https://ui-avatars.com/api/?name=${authorName}&background=3b82f6&color=fff&size=40`;

    const newPostData: Post = {
      id: Date.now().toString(),
      author: authorName,
      author_name: authorName,
      author_username: userData?.username || userData?.email?.split('@')[0] || 'user',
      authorAvatar: authorAvatar,
      content: newPost.trim(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      isLiked: false,
      isSaved: false,
      timestamp: 'Baru saja',
      userId: userData?.id || (isDemoUser ? 'demo-user' : currentUserId),
      isOwnPost: true,
      createdAt: new Date().toISOString()
    };
    
    // Add post using GlobalPostService for synchronization
    globalPostService.addPost(newPostData);
    
    // Also save to postStorageService for backward compatibility
    postStorageService.addPost(newPostData);
    
    // Reset form
    setNewPost('');
    setSelectedImages([]);
    setShowCreatePost(false);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCreatePostFromModal = async () => {
    if (!createPostForm.content.trim() && !createPostForm.media) return;
    
    // Get user data from localStorage to ensure consistency
    const savedUser = localStorage.getItem('mikasa_user');
    let userData = null;
    if (savedUser) {
      try {
        userData = JSON.parse(savedUser);
        console.log('📋 Using saved user data for modal post:', userData);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
      }
    }

    // Use global profile data or fallback to saved user data
    const authorName = globalProfileData?.name || userData?.name || 'Anonymous';
    const authorAvatar = globalProfileData?.profileImage || userData?.profileImage || `https://ui-avatars.com/api/?name=${authorName}&background=3b82f6&color=fff&size=40`;
    
    const newPostData: Post = {
      id: Date.now().toString(),
      author: authorName,
      author_name: authorName,
      author_username: userData?.username || userData?.email?.split('@')[0] || 'user',
      authorAvatar: authorAvatar,
      content: createPostForm.content.trim(),
      images: createPostForm.media ? [await convertFileToBase64(createPostForm.media)] : undefined,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      isLiked: false,
      isSaved: false,
      timestamp: 'Baru saja',
      userId: userData?.id || (isDemoUser ? 'demo-user' : currentUserId),
      isOwnPost: true,
      createdAt: new Date().toISOString()
    };
    
    // Add post using GlobalPostService for synchronization
    globalPostService.addPost(newPostData);
    
    // Also save to postStorageService for backward compatibility
    postStorageService.addPost(newPostData);
    
    // Reset form
    setCreatePostForm({
      content: '',
      type: 'text',
      media: null
    });
    setShowCreatePost(false);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls = await Promise.all(Array.from(files).map(file => convertFileToBase64(file)));
      setSelectedImages(prev => [...prev, ...imageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-all duration-300"
              title="Buat Post"
            >
              <Plus size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Feed</h1>
            </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
              title="Pencarian"
            >
              <Search size={20} />
            </button>
            <button 
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
              title="Notifikasi"
            >
              <Bell size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Profile Picture */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            {globalProfileData?.profileImage ? (
              <img 
                src={globalProfileData.profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${globalProfileData?.name || 'User'}&background=3b82f6&color=fff&size=40`;
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${globalProfileData?.name || 'User'}&background=3b82f6&color=fff&size=40`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Create Post Input */}
                <button 
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
            title="Buat Postingan"
                >
            Apa yang sedang Anda pikirkan?
                </button>
              </div>
        
        {/* Post Options */}
        <div className="flex items-center justify-around">
          <button 
            className="flex items-center gap-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-2 rounded-lg transition-all duration-300"
            title="Upload Foto"
          >
            <Image size={20} />
            <span className="text-sm font-medium">Foto</span>
          </button>
          <button 
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all duration-300"
            title="Upload Video"
          >
            <Video size={20} />
            <span className="text-sm font-medium">Video</span>
          </button>
          <button 
            className="flex items-center gap-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-3 py-2 rounded-lg transition-all duration-300"
            title="Tambah Perasaan"
          >
            <Smile size={20} />
            <span className="text-sm font-medium">Perasaan</span>
          </button>
              </div>
            </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mx-4 mt-2 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-sm">✅ Postingan berhasil dibuat!</p>
          </div>
      )}

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50 transition-all duration-200"
                  onClick={() => handlePostAuthorClick(post.author, post.authorAvatar)}
                >
                  {post.authorAvatar ? (
                <img 
                  src={post.authorAvatar} 
                  alt={post.author}
                  className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('❌ Failed to load authorAvatar:', post.authorAvatar, 'for post:', post.id);
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${post.author}&background=3b82f6&color=fff&size=40`;
                      }}
                      onLoad={() => {
                        console.log('✅ Successfully loaded authorAvatar:', post.authorAvatar, 'for post:', post.id);
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${post.author}&background=3b82f6&color=fff&size=40`}
                      alt={post.author}
                      className="w-full h-full object-cover"
                    />
                  )}
                      </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      onClick={() => handlePostAuthorClick(post.author, post.authorAvatar)}
                    >
                      {post.author}
                    </h3>
                    {verifiedAccounts.includes(post.author) && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(() => {
                      try {
                        const date = new Date(post.timestamp);
                        if (isNaN(date.getTime())) {
                          return 'Baru saja';
                        }
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);
                        
                        if (diffDays > 0) {
                          return `${diffDays} hari lalu`;
                        } else if (diffHours > 0) {
                          return `${diffHours} jam lalu`;
                        } else {
                          return 'Baru saja';
                        }
                      } catch {
                        return 'Baru saja';
                      }
                  })()}
                  </p>
                </div>
              </div>
              
              {/* Delete button - only for own posts */}
              {post.author === (globalProfileData?.name || globalProfileData?.userData?.name) && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300 text-red-500 hover:text-red-600"
                  title="Hapus Postingan"
                >
                  <Trash2 size={18} />
                </button>
              )}
              
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{post.content}</p>
            </div>
                
                {/* Post Images */}
                {post.images && post.images.length > 0 && (
              <div className="px-4 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                              src={image} 
                              alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                        ))}
                      </div>
                  </div>
                )}

            {/* Post Actions */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    post.isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
                  <span className="text-sm">{post.likes}</span>
                </button>
                
                <button 
                  onClick={() => handleComment(post)}
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-all duration-300"
                >
                  <MessageCircle size={20} />
                  <span className="text-sm">{post.comments}</span>
                </button>
                
                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-all duration-300"
                >
                  <Share2 size={20} />
                  <span className="text-sm">{post.shares}</span>
                </button>
              </div>
                  
              <button
                onClick={() => handleSave(post.id)}
                className={`transition-all duration-300 ${
                  post.isSaved 
                    ? 'text-yellow-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
                }`}
              >
                <Bookmark size={20} fill={post.isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        ))}

        {displayPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Tidak ada postingan yang ditemukan' : 'Belum ada postingan'}
            </p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buat Postingan</h2>
                            <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
                            >
                  <X size={20} />
                            </button>
                        </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {globalProfileData?.profileImage ? (
                    <img 
                      src={globalProfileData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${globalProfileData?.name || 'User'}&background=3b82f6&color=fff&size=40`;
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${globalProfileData?.name || 'User'}&background=3b82f6&color=fff&size=40`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
              )}
            </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {globalProfileData?.name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Public</p>
          </div>
      </div>

            <textarea
                value={createPostForm.content}
                onChange={(e) => setCreatePostForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Apa yang sedang Anda pikirkan?"
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCreatePostForm(prev => ({ ...prev, media: file, type: 'photo' }));
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full cursor-pointer transition-all duration-300"
                  >
                    <Image size={20} />
                  </label>
                  <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-300">
                    <Video size={20} />
              </button>
                  <button className="p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-all duration-300">
                    <Smile size={20} />
              </button>
            </div>
            <button
                  onClick={handleCreatePostFromModal}
                  disabled={!createPostForm.content.trim() && !createPostForm.media}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
            >
                  Posting
            </button>
              </div>

              {createPostForm.media && (
                <div className="mt-4">
            <img 
                    src={createPostForm.media instanceof File ? URL.createObjectURL(createPostForm.media) : createPostForm.media}
              alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
            />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Komentar</h2>
        <button
                  onClick={() => setShowCommentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
                >
                  <X size={20} />
        </button>
          </div>

              {/* Original Post */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src={selectedPost.authorAvatar || `https://ui-avatars.com/api/?name=${selectedPost.author}&background=3b82f6&color=fff&size=32`}
                      alt={selectedPost.author}
                      className="w-full h-full object-cover"
                    />
          </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{selectedPost.author}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPost.timestamp}</p>
          </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200">{selectedPost.content}</p>
      </div>

              {/* Comments */}
              <div className="space-y-4 mb-6">
                {selectedPost.commentsData?.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src={comment.authorAvatar}
                        alt={comment.author}
                        className="w-full h-full object-cover"
                      />
            </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                        <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{comment.author}</h5>
                        <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.content}</p>
          </div>
                      <div className="flex items-center gap-4 mt-1 px-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
                        <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500">Suka</button>
                        <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500">Balas</button>
        </div>
              </div>
              </div>
                ))}
            </div>

              {/* Add Comment */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={globalProfileData?.profileImage || `https://ui-avatars.com/api/?name=${globalProfileData?.name || 'User'}&background=3b82f6&color=fff&size=32`}
                    alt="Your avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tulis komentar..."
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Kirim
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bagikan Postingan</h2>
              <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
                >
                  <X size={20} />
              </button>
              </div>
              
              <div className="space-y-3">
              <button
                  onClick={() => {
                    const postUrl = `${window.location.origin}/post/${selectedPost.id}`;
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(postUrl).then(() => {
                        alert('Link berhasil disalin!');
                        globalPostService.incrementShares(selectedPost.id);
                        setShowShareModal(false);
                      }).catch(() => {
                        // Fallback for older browsers
                        const textarea = document.createElement('textarea');
                        textarea.value = postUrl;
                        document.body.appendChild(textarea);
                        textarea.select();
                        try {
                          document.execCommand('copy');
                          alert('Link berhasil disalin!');
                          globalPostService.incrementShares(selectedPost.id);
                          setShowShareModal(false);
                        } catch (err) {
                          // Final fallback - show prompt
                          const userInput = window.prompt('Salin link ini:', postUrl);
                          if (userInput !== null) {
                            globalPostService.incrementShares(selectedPost.id);
                            setShowShareModal(false);
                          }
                        }
                        document.body.removeChild(textarea);
                      });
                    } else {
                      // Fallback for browsers without clipboard API
                      const textarea = document.createElement('textarea');
                      textarea.value = postUrl;
                      document.body.appendChild(textarea);
                      textarea.select();
                      try {
                        document.execCommand('copy');
                        alert('Link berhasil disalin!');
                        globalPostService.incrementShares(selectedPost.id);
                        setShowShareModal(false);
                      } catch (err) {
                        // Final fallback - show prompt
                        const userInput = window.prompt('Salin link ini:', postUrl);
                        if (userInput !== null) {
                          globalPostService.incrementShares(selectedPost.id);
                          setShowShareModal(false);
                        }
                      }
                      document.body.removeChild(textarea);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Share2 size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                  <span className="text-gray-900 dark:text-white">Salin Link</span>
              </button>
              
              <button
                  onClick={() => {
                    const postText = `${selectedPost.content}\n\nDibagikan dari Mikasa AI`;
                    const postUrl = `${window.location.origin}/post/${selectedPost.id}`;
                    const shareData = `${postText}\n${postUrl}`;
                    
                    if (navigator.share) {
                      navigator.share({
                        title: 'Postingan dari Mikasa AI',
                        text: postText,
                        url: postUrl,
                      }).then(() => {
                        globalPostService.incrementShares(selectedPost.id);
                        setShowShareModal(false);
                      });
                    } else {
                      // Fallback - copy to clipboard
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(shareData).then(() => {
                          alert('Konten berhasil disalin! Bagikan di aplikasi favorit Anda.');
                          globalPostService.incrementShares(selectedPost.id);
                          setShowShareModal(false);
                        });
                      }
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Share2 size={20} className="text-green-600 dark:text-green-400" />
                </div>
                  <span className="text-gray-900 dark:text-white">Bagikan ke Aplikasi Lain</span>
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian</h2>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                placeholder="Cari postingan atau pengguna..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />

              {/* Search Tabs */}
              <div className="flex mt-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSearchTab('posts')}
                  title="Tab untuk mencari postingan"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
                >
                  Nama Pengguna ({searchResults.length})
                </button>
              </div>

              {/* Search Results */}
              <div className="mt-4 max-h-96 overflow-y-auto">
                {searchQuery && (
                  <>
                    <div className="space-y-2">
                      {searchResults.length > 0 ? (
                        searchResults.map(post => (
                          <div key={post.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                {post.authorAvatar ? (
                                  <img 
                                    src={post.authorAvatar} 
                                    alt={post.author}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img 
                                    src={`https://ui-avatars.com/api/?name=${post.author}&background=3b82f6&color=fff&size=32`}
                                    alt={post.author}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                  onClick={() => handlePostAuthorClick(post.author, post.authorAvatar)}
                                >
                                  {post.author}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {post.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                          Tidak ada postingan ditemukan
                        </p>
                      )}
                    </div>
                  </>
                )}

                {!searchQuery && (
                  <div className="text-center py-8">
                    <Search size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Mulai mengetik untuk mencari postingan atau pengguna
                    </p>
                    <div className="mt-4 text-sm text-gray-400">
                      <p>Gunakan fitur pencarian untuk menemukan postingan</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
});

export default FeedPage;
