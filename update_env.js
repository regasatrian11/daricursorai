import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Update Supabase API Key');
console.log('📋 Langkah-langkah:');
console.log('1. Buka: https://supabase.com/dashboard/project/dsxiymksrubpryxggyow');
console.log('2. Klik "Settings" → "API"');
console.log('3. Copy "anon public" key (bukan service role)');
console.log('');

rl.question('📝 Masukkan API key yang baru: ', (newApiKey) => {
  if (!newApiKey || newApiKey.trim() === '') {
    console.log('❌ API key tidak boleh kosong!');
    rl.close();
    return;
  }

  const envContent = `VITE_SUPABASE_URL=https://dsxiymksrubpryxggyow.supabase.co
VITE_SUPABASE_ANON_KEY=${newApiKey.trim()}
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_FORCE_DEMO_MODE=false`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ File .env berhasil diperbarui!');
    console.log('🔑 API key baru:', newApiKey.substring(0, 20) + '...');
    console.log('\n🧪 Testing koneksi...');
    
    // Test the new API key
    import('./debug_storage.js').then(() => {
      rl.close();
    });
  } catch (error) {
    console.error('❌ Gagal memperbarui file .env:', error.message);
    rl.close();
  }
});
