// Script untuk menghapus semua data localStorage
// Jalankan script ini di browser console

console.log('🧹 Starting localStorage cleanup...');

const clearAllLocalStorage = () => {
  console.log('📊 Analyzing localStorage before cleanup...');
  
  // Get all localStorage keys
  const allKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      allKeys.push(key);
    }
  }
  
  console.log(`Found ${allKeys.length} localStorage items:`, allKeys);
  
  // Calculate total size
  let totalSize = 0;
  allKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      totalSize += new Blob([value]).size;
    }
  });
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  console.log(`Total localStorage size: ${formatBytes(totalSize)}`);
  
  // Confirm deletion
  const confirmed = confirm(
    `Found ${allKeys.length} localStorage items (${formatBytes(totalSize)}).\n\n` +
    `Do you want to delete ALL localStorage data?\n\n` +
    `⚠️ WARNING: This action cannot be undone!`
  );
  
  if (!confirmed) {
    console.log('❌ Cleanup cancelled by user');
    return;
  }
  
  // Clear all localStorage
  let removedCount = 0;
  allKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`🗑️ Removed: ${key}`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
    }
  });
  
  console.log(`✅ localStorage cleanup completed!`);
  console.log(`📊 Removed ${removedCount} items`);
  console.log(`💾 Freed up ${formatBytes(totalSize)} of storage`);
  
  // Verify cleanup
  const remainingKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      remainingKeys.push(key);
    }
  }
  
  if (remainingKeys.length === 0) {
    console.log('🎉 localStorage is completely empty!');
    alert('✅ localStorage berhasil dibersihkan!\n\n' +
          `📊 ${removedCount} item dihapus\n` +
          `💾 ${formatBytes(totalSize)} storage dibebaskan\n\n` +
          'localStorage sekarang kosong.');
  } else {
    console.log('⚠️ Some items remain:', remainingKeys);
    alert(`⚠️ Pembersihan sebagian berhasil!\n\n` +
          `✅ ${removedCount} item dihapus\n` +
          `⚠️ ${remainingKeys.length} item masih ada: ${remainingKeys.join(', ')}`);
  }
};

const clearMikasaLocalStorage = () => {
  console.log('🧹 Starting Mikasa localStorage cleanup...');
  
  // Get Mikasa-related keys
  const mikasaKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mikasa_')) {
      mikasaKeys.push(key);
    }
  }
  
  if (mikasaKeys.length === 0) {
    console.log('✅ No Mikasa localStorage data found');
    alert('✅ Tidak ada data Mikasa di localStorage');
    return;
  }
  
  console.log(`Found ${mikasaKeys.length} Mikasa items:`, mikasaKeys);
  
  // Calculate size
  let totalSize = 0;
  mikasaKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      totalSize += new Blob([value]).size;
    }
  });
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Confirm deletion
  const confirmed = confirm(
    `Found ${mikasaKeys.length} Mikasa localStorage items (${formatBytes(totalSize)}).\n\n` +
    `Do you want to delete all Mikasa localStorage data?\n\n` +
    `⚠️ WARNING: This will delete all your local Mikasa data!`
  );
  
  if (!confirmed) {
    console.log('❌ Mikasa cleanup cancelled by user');
    return;
  }
  
  // Clear Mikasa localStorage
  let removedCount = 0;
  mikasaKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`🗑️ Removed: ${key}`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
    }
  });
  
  console.log(`✅ Mikasa localStorage cleanup completed!`);
  console.log(`📊 Removed ${removedCount} Mikasa items`);
  console.log(`💾 Freed up ${formatBytes(totalSize)} of storage`);
  
  alert('✅ Mikasa localStorage berhasil dibersihkan!\n\n' +
        `📊 ${removedCount} item Mikasa dihapus\n` +
        `💾 ${formatBytes(totalSize)} storage dibebaskan\n\n` +
        'Semua data lokal Mikasa telah dihapus.');
};

const analyzeLocalStorage = () => {
  console.log('🔍 Analyzing localStorage...');
  
  const allKeys = [];
  const mikasaKeys = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      allKeys.push(key);
      if (key.startsWith('mikasa_')) {
        mikasaKeys.push(key);
      }
    }
  }
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  let allSize = 0;
  let mikasaSize = 0;
  
  allKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      const size = new Blob([value]).size;
      allSize += size;
      if (key.startsWith('mikasa_')) {
        mikasaSize += size;
      }
    }
  });
  
  console.log('📊 localStorage Analysis:');
  console.log(`Total items: ${allKeys.length}`);
  console.log(`Total size: ${formatBytes(allSize)}`);
  console.log(`Mikasa items: ${mikasaKeys.length}`);
  console.log(`Mikasa size: ${formatBytes(mikasaSize)}`);
  console.log('All keys:', allKeys);
  console.log('Mikasa keys:', mikasaKeys);
  
  return {
    totalItems: allKeys.length,
    totalSize: formatBytes(allSize),
    mikasaItems: mikasaKeys.length,
    mikasaSize: formatBytes(mikasaSize),
    allKeys,
    mikasaKeys
  };
};

// Export functions to global scope
window.clearAllLocalStorage = clearAllLocalStorage;
window.clearMikasaLocalStorage = clearMikasaLocalStorage;
window.analyzeLocalStorage = analyzeLocalStorage;

console.log('✅ localStorage cleanup script loaded!');
console.log('Available commands:');
console.log('- clearAllLocalStorage() - Delete ALL localStorage data');
console.log('- clearMikasaLocalStorage() - Delete only Mikasa localStorage data');
console.log('- analyzeLocalStorage() - Analyze localStorage usage');

// Auto-run analysis
const analysis = analyzeLocalStorage();

// Show quick action buttons in console
console.log('\n🚀 Quick Actions:');
console.log('1. clearMikasaLocalStorage() - Remove only Mikasa data');
console.log('2. clearAllLocalStorage() - Remove ALL localStorage data');
console.log('3. analyzeLocalStorage() - Show detailed analysis');

// Auto-suggest based on findings
if (analysis.mikasaItems > 0) {
  console.log(`\n💡 Found ${analysis.mikasaItems} Mikasa items (${analysis.mikasaSize})`);
  console.log('💡 Run clearMikasaLocalStorage() to remove only Mikasa data');
}

if (analysis.totalItems > 10) {
  console.log(`\n⚠️ Found ${analysis.totalItems} total items (${analysis.totalSize})`);
  console.log('⚠️ Consider clearAllLocalStorage() to free up space');
}

