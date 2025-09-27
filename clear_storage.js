// Script to clear localStorage and free up space
console.log('🧹 Clearing localStorage...');

// List of keys to remove
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

// Remove specified keys
let removedCount = 0;
keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    removedCount++;
    console.log(`✅ Removed ${key}`);
  }
});

// Get current storage usage
const currentUsage = JSON.stringify(localStorage).length;
console.log(`📊 Current localStorage usage: ${(currentUsage / 1024).toFixed(2)} KB`);
console.log(`🗑️ Removed ${removedCount} items`);

// Show remaining keys
const remainingKeys = Object.keys(localStorage);
console.log(`📋 Remaining keys: ${remainingKeys.length}`);
remainingKeys.forEach(key => {
  const size = localStorage.getItem(key).length;
  console.log(`  - ${key}: ${(size / 1024).toFixed(2)} KB`);
});

console.log('✅ Storage cleanup completed!');
