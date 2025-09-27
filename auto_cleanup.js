// Auto cleanup script untuk mengatasi storage penuh
console.log('🧹 Auto cleanup script loaded');

// Function untuk membersihkan storage
function autoCleanupStorage() {
  console.log('🧹 Starting auto cleanup...');
  
  const keysToRemove = [
    'mikasa_old_posts',
    'mikasa_temp_data', 
    'mikasa_cache',
    'mikasa_all_users',
    'mikasa_global_posts',
    'mikasa_global_profiles',
    'mikasa_friends',
    'mikasa_following',
    'mikasa_messages',
    'mikasa_conversations',
    'mikasa_chat_sessions',
    'mikasa_old_data',
    'mikasa_backup_data',
    'mikasa_temp_posts',
    'mikasa_temp_profiles',
    'mikasa_temp_messages'
  ];
  
  let removedCount = 0;
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Removed ${key}`);
    }
  });
  
  console.log(`🗑️ Auto cleanup completed: ${removedCount} items removed`);
  return removedCount;
}

// Function untuk mengecek storage usage
function checkStorageUsage() {
  const totalSize = JSON.stringify(localStorage).length;
  const usagePercent = (totalSize / (5 * 1024 * 1024)) * 100;
  
  console.log(`📊 Storage usage: ${(totalSize / 1024).toFixed(2)} KB (${usagePercent.toFixed(2)}%)`);
  
  if (usagePercent > 80) {
    console.log('⚠️ Storage usage high, running auto cleanup...');
    autoCleanupStorage();
  }
  
  return usagePercent;
}

// Export functions untuk digunakan di aplikasi
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { autoCleanupStorage, checkStorageUsage };
} else {
  window.autoCleanupStorage = autoCleanupStorage;
  window.checkStorageUsage = checkStorageUsage;
}

// Auto run cleanup saat script dimuat
if (typeof window !== 'undefined') {
  checkStorageUsage();
}
