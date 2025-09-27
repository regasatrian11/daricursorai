// Script to clear corrupted authentication data
console.log('🧹 Clearing corrupted authentication data...');

// Clear Mikasa data
localStorage.removeItem('mikasa_user');
localStorage.removeItem('mikasa_session');

// Clear Supabase data
localStorage.removeItem('sb-dsxiymksrubpryxggyow-auth-token');
localStorage.removeItem('supabase.auth.token');

// Clear any other Supabase related data
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    localStorage.removeItem(key);
    console.log('🗑️ Removed:', key);
  }
});

console.log('✅ Authentication data cleared! Please refresh the page.');

