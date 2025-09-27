// Comprehensive Migration Script: localStorage to Supabase
// Run this script in browser console or as a service

import { supabase } from './src/lib/supabase.js';

class LocalStorageToSupabaseMigration {
  constructor() {
    this.migrationResults = {
      profiles: { success: 0, failed: 0, errors: [] },
      posts: { success: 0, failed: 0, errors: [] },
      messages: { success: 0, failed: 0, errors: [] },
      conversations: { success: 0, failed: 0, errors: [] },
      settings: { success: 0, failed: 0, errors: [] }
    };
  }

  // Main migration function
  async migrateAllData() {
    console.log('🚀 Starting comprehensive migration from localStorage to Supabase...');
    
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated. Please login first.');
      }

      console.log('✅ User authenticated:', user.email);

      // Migrate data in order of dependencies
      await this.migrateProfiles();
      await this.migratePosts();
      await this.migrateMessages();
      await this.migrateConversations();
      await this.migrateSettings();

      // Show migration summary
      this.showMigrationSummary();

      // Optionally clear localStorage after successful migration
      if (confirm('Migration completed successfully! Do you want to clear localStorage now?')) {
        this.clearLocalStorage();
      }

    } catch (error) {
      console.error('❌ Migration failed:', error);
      alert('Migration failed: ' + error.message);
    }
  }

  // Migrate user profiles
  async migrateProfiles() {
    console.log('📋 Migrating profiles...');
    
    try {
      // Get current user data from localStorage
      const userData = localStorage.getItem('mikasa_user');
      const profileImage = localStorage.getItem('mikasa_profile_image');
      const coverPhoto = localStorage.getItem('mikasa_cover_photo');
      const bio = localStorage.getItem('mikasa_bio');

      if (userData) {
        const user = JSON.parse(userData);
        const { data: { user: authUser } } = await supabase.auth.getUser();

        // Prepare profile data for Supabase
        const profileData = {
          id: authUser.id,
          email: authUser.email || user.email,
          full_name: user.name || user.full_name || authUser.user_metadata?.full_name,
          username: user.username || authUser.user_metadata?.username,
          avatar_url: profileImage || user.profileImage || user.avatar_url,
          cover_photo_url: coverPhoto || user.coverPhoto || user.cover_photo_url,
          bio: bio || user.bio || 'Welcome to my profile!',
          whatsapp: user.whatsapp || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Upsert profile (insert or update)
        const { error } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });

        if (error) {
          console.error('❌ Error migrating profile:', error);
          this.migrationResults.profiles.failed++;
          this.migrationResults.profiles.errors.push(error.message);
        } else {
          console.log('✅ Profile migrated successfully');
          this.migrationResults.profiles.success++;
        }
      }
    } catch (error) {
      console.error('❌ Profile migration error:', error);
      this.migrationResults.profiles.failed++;
      this.migrationResults.profiles.errors.push(error.message);
    }
  }

  // Migrate posts
  async migratePosts() {
    console.log('📝 Migrating posts...');
    
    try {
      const postsData = localStorage.getItem('mikasa_posts');
      
      if (postsData) {
        const posts = JSON.parse(postsData);
        const { data: { user } } = await supabase.auth.getUser();

        for (const post of posts) {
          try {
            // Prepare post data for Supabase
            const postData = {
              id: post.id,
              user_id: user.id,
              author_name: post.author || post.author_name || user.user_metadata?.full_name || 'Anonymous',
              author_username: post.author_name || user.user_metadata?.username || 'user',
              author_avatar: post.authorAvatar || user.user_metadata?.avatar_url,
              content: post.content || post.text || '',
              media_url: post.images?.[0] || post.media_url,
              media_type: post.images?.[0] ? 'image' : (post.type || 'text'),
              likes_count: post.likes || post.likes_count || 0,
              comments_count: post.comments || post.comments_count || 0,
              shares_count: post.shares || post.shares_count || 0,
              saves_count: post.saves || post.saves_count || 0,
              is_public: true,
              created_at: post.createdAt || post.timestamp || new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // Insert post
            const { error } = await supabase
              .from('user_posts')
              .upsert(postData, { onConflict: 'id' });

            if (error) {
              console.error('❌ Error migrating post:', post.id, error);
              this.migrationResults.posts.failed++;
              this.migrationResults.posts.errors.push(`Post ${post.id}: ${error.message}`);
            } else {
              console.log('✅ Post migrated:', post.id);
              this.migrationResults.posts.success++;
            }
          } catch (postError) {
            console.error('❌ Error processing post:', post.id, postError);
            this.migrationResults.posts.failed++;
            this.migrationResults.posts.errors.push(`Post ${post.id}: ${postError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Posts migration error:', error);
      this.migrationResults.posts.failed++;
      this.migrationResults.posts.errors.push(error.message);
    }
  }

  // Migrate messages
  async migrateMessages() {
    console.log('💬 Migrating messages...');
    
    try {
      const messagesData = localStorage.getItem('mikasa_messages');
      const conversationsData = localStorage.getItem('mikasa_conversations');
      
      if (messagesData) {
        const messages = JSON.parse(messagesData);
        const { data: { user } } = await supabase.auth.getUser();

        // First, create chat sessions for conversations
        const chatSessions = new Map();
        
        if (conversationsData) {
          const conversations = JSON.parse(conversationsData);
          for (const conv of conversations) {
            try {
              const { data: sessionData, error: sessionError } = await supabase
                .from('chat_sessions')
                .insert({
                  user_id: user.id,
                  title: conv.title || `Chat ${conv.id}`,
                  created_at: conv.createdAt || new Date().toISOString()
                })
                .select('id')
                .single();

              if (!sessionError && sessionData) {
                chatSessions.set(conv.id, sessionData.id);
                console.log('✅ Chat session created:', sessionData.id);
              }
            } catch (sessionErr) {
              console.error('❌ Error creating chat session:', sessionErr);
            }
          }
        }

        // Then migrate messages
        for (const message of messages) {
          try {
            const sessionId = chatSessions.get(message.conversationId || message.chatId);
            
            if (sessionId) {
              const { error } = await supabase
                .from('messages')
                .insert({
                  chat_session_id: sessionId,
                  content: message.content || message.text || '',
                  role: message.role || (message.isUser ? 'user' : 'assistant'),
                  created_at: message.timestamp || message.createdAt || new Date().toISOString()
                });

              if (error) {
                console.error('❌ Error migrating message:', error);
                this.migrationResults.messages.failed++;
                this.migrationResults.messages.errors.push(error.message);
              } else {
                this.migrationResults.messages.success++;
              }
            }
          } catch (messageError) {
            console.error('❌ Error processing message:', messageError);
            this.migrationResults.messages.failed++;
            this.migrationResults.messages.errors.push(messageError.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Messages migration error:', error);
      this.migrationResults.messages.failed++;
      this.migrationResults.messages.errors.push(error.message);
    }
  }

  // Migrate conversations
  async migrateConversations() {
    console.log('🗨️ Migrating conversations...');
    
    try {
      const conversationsData = localStorage.getItem('mikasa_conversations');
      
      if (conversationsData) {
        const conversations = JSON.parse(conversationsData);
        const { data: { user } } = await supabase.auth.getUser();

        for (const conv of conversations) {
          try {
            // Check if session already exists
            const { data: existingSession } = await supabase
              .from('chat_sessions')
              .select('id')
              .eq('title', conv.title || `Chat ${conv.id}`)
              .eq('user_id', user.id)
              .single();

            if (!existingSession) {
              const { error } = await supabase
                .from('chat_sessions')
                .insert({
                  user_id: user.id,
                  title: conv.title || `Chat ${conv.id}`,
                  created_at: conv.createdAt || new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (error) {
                console.error('❌ Error migrating conversation:', error);
                this.migrationResults.conversations.failed++;
                this.migrationResults.conversations.errors.push(error.message);
              } else {
                console.log('✅ Conversation migrated:', conv.id);
                this.migrationResults.conversations.success++;
              }
            }
          } catch (convError) {
            console.error('❌ Error processing conversation:', conv.id, convError);
            this.migrationResults.conversations.failed++;
            this.migrationResults.conversations.errors.push(`Conv ${conv.id}: ${convError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Conversations migration error:', error);
      this.migrationResults.conversations.failed++;
      this.migrationResults.conversations.errors.push(error.message);
    }
  }

  // Migrate settings
  async migrateSettings() {
    console.log('⚙️ Migrating settings...');
    
    try {
      const settingsKeys = [
        'mikasa_theme',
        'mikasa_language',
        'mikasa_notifications',
        'mikasa_privacy_settings'
      ];

      const settingsData = {};
      
      for (const key of settingsKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          settingsData[key.replace('mikasa_', '')] = JSON.parse(value);
        }
      }

      if (Object.keys(settingsData).length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Store settings in user metadata or a settings table
        const { error } = await supabase.auth.updateUser({
          data: settingsData
        });

        if (error) {
          console.error('❌ Error migrating settings:', error);
          this.migrationResults.settings.failed++;
          this.migrationResults.settings.errors.push(error.message);
        } else {
          console.log('✅ Settings migrated successfully');
          this.migrationResults.settings.success++;
        }
      }
    } catch (error) {
      console.error('❌ Settings migration error:', error);
      this.migrationResults.settings.failed++;
      this.migrationResults.settings.errors.push(error.message);
    }
  }

  // Show migration summary
  showMigrationSummary() {
    console.log('📊 Migration Summary:');
    console.log('==================');
    
    Object.entries(this.migrationResults).forEach(([type, result]) => {
      console.log(`${type.toUpperCase()}:`);
      console.log(`  ✅ Success: ${result.success}`);
      console.log(`  ❌ Failed: ${result.failed}`);
      if (result.errors.length > 0) {
        console.log(`  🚨 Errors:`, result.errors);
      }
    });

    const totalSuccess = Object.values(this.migrationResults).reduce((sum, result) => sum + result.success, 0);
    const totalFailed = Object.values(this.migrationResults).reduce((sum, result) => sum + result.failed, 0);
    
    console.log(`\n📈 Total: ${totalSuccess} successful, ${totalFailed} failed`);
    
    if (totalFailed === 0) {
      console.log('🎉 All data migrated successfully!');
    } else {
      console.log('⚠️ Some data failed to migrate. Check errors above.');
    }
  }

  // Clear localStorage after successful migration
  clearLocalStorage() {
    console.log('🧹 Clearing localStorage...');
    
    const keysToRemove = [
      'mikasa_user',
      'mikasa_posts',
      'mikasa_messages',
      'mikasa_conversations',
      'mikasa_profile_image',
      'mikasa_cover_photo',
      'mikasa_bio',
      'mikasa_theme',
      'mikasa_language',
      'mikasa_notifications',
      'mikasa_privacy_settings',
      'mikasa_session',
      'mikasa_demo_data',
      'mikasa_temp_data',
      'mikasa_cache'
    ];

    let removedCount = 0;
    
    for (const key of keysToRemove) {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          removedCount++;
          console.log(`🗑️ Removed: ${key}`);
        }
      } catch (error) {
        console.error(`❌ Error removing ${key}:`, error);
      }
    }

    // Also remove any keys that start with 'mikasa_'
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith('mikasa_')) {
        try {
          localStorage.removeItem(key);
          removedCount++;
          console.log(`🗑️ Removed: ${key}`);
        } catch (error) {
          console.error(`❌ Error removing ${key}:`, error);
        }
      }
    }

    console.log(`✅ localStorage cleared! Removed ${removedCount} items.`);
    alert(`Migration completed! Removed ${removedCount} localStorage items.`);
  }

  // Get localStorage usage info
  getLocalStorageInfo() {
    const info = {
      totalSize: 0,
      items: []
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      
      info.totalSize += size;
      info.items.push({
        key,
        size,
        sizeFormatted: this.formatBytes(size)
      });
    }

    info.totalSizeFormatted = this.formatBytes(info.totalSize);
    return info;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export for use
export default LocalStorageToSupabaseMigration;

// Usage example:
// const migration = new LocalStorageToSupabaseMigration();
// await migration.migrateAllData();
