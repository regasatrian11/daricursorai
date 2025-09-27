// Script cepat untuk menghapus localStorage
// Copy paste ini di browser console dan jalankan

console.log('🧹 Quick localStorage Cleaner');

// Fungsi untuk menghapus semua localStorage
const quickClear = () => {
  const itemCount = localStorage.length;
  const keys = [];
  
  // Get all keys
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }
  
  console.log(`Found ${itemCount} localStorage items:`, keys);
  
  // Clear all
  localStorage.clear();
  
  console.log('✅ localStorage cleared!');
  console.log(`📊 ${itemCount} items removed`);
  
  alert(`✅ localStorage berhasil dibersihkan!\n\n📊 ${itemCount} item dihapus\n\nHalaman akan direfresh.`);
  
  // Refresh page
  window.location.reload();
};

// Fungsi untuk menghapus hanya data Mikasa
const clearMikasa = () => {
  const mikasaKeys = [];
  
  // Find Mikasa keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mikasa_')) {
      mikasaKeys.push(key);
    }
  }
  
  if (mikasaKeys.length === 0) {
    alert('✅ Tidak ada data Mikasa di localStorage');
    return;
  }
  
  console.log(`Found ${mikasaKeys.length} Mikasa items:`, mikasaKeys);
  
  // Remove Mikasa keys
  mikasaKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
  
  console.log('✅ Mikasa localStorage cleared!');
  console.log(`📊 ${mikasaKeys.length} Mikasa items removed`);
  
  alert(`✅ Data Mikasa berhasil dihapus!\n\n📊 ${mikasaKeys.length} item dihapus`);
};

// Export functions
window.quickClear = quickClear;
window.clearMikasa = clearMikasa;

console.log('🚀 Quick commands available:');
console.log('- quickClear() - Hapus SEMUA localStorage');
console.log('- clearMikasa() - Hapus hanya data Mikasa');

// Auto-run quick clear if user wants
console.log('\n💡 Untuk menghapus semua localStorage, jalankan: quickClear()');
console.log('💡 Untuk menghapus hanya data Mikasa, jalankan: clearMikasa()');

