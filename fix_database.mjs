// Script to fix database schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsxiymksrubpryxggyow.supabase.co';
const supabaseKey = 'sb_secret_kXfCKeXZcOH9K9qoPfmIuQ_HWTC1V0t';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  try {
    console.log('🔄 Fixing database schema...');
    
    // 1. Add bio column to profiles table
    console.log('🔄 Adding bio column to profiles table...');
    const { error: bioError } = await supabase
      .from('profiles')
      .select('bio')
      .limit(1);
    
    if (bioError && bioError.code === 'PGRST204') {
      console.log('❌ Bio column does not exist, need to add it manually');
      console.log('💡 Please run this SQL in your Supabase dashboard:');
      console.log('ALTER TABLE profiles ADD COLUMN bio TEXT;');
    } else {
      console.log('✅ Bio column exists');
    }
    
    // 2. Add cover_photo_url column to profiles table
    console.log('🔄 Checking cover_photo_url column...');
    const { error: coverError } = await supabase
      .from('profiles')
      .select('cover_photo_url')
      .limit(1);
    
    if (coverError && coverError.code === 'PGRST204') {
      console.log('❌ cover_photo_url column does not exist, need to add it manually');
      console.log('💡 Please run this SQL in your Supabase dashboard:');
      console.log('ALTER TABLE profiles ADD COLUMN cover_photo_url TEXT;');
    } else {
      console.log('✅ cover_photo_url column exists');
    }
    
    // 3. Test if we can insert/update profiles
    console.log('🔄 Testing profile operations...');
    
    // Try to get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ No authenticated user, cannot test profile operations');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Try to insert a test profile
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        bio: 'Test bio',
        cover_photo_url: 'https://example.com/cover.jpg'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      
      if (insertError.code === 'PGRST204') {
        console.log('💡 Missing columns detected. Please run these SQL commands in your Supabase dashboard:');
        console.log('ALTER TABLE profiles ADD COLUMN bio TEXT;');
        console.log('ALTER TABLE profiles ADD COLUMN cover_photo_url TEXT;');
        console.log('ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
      }
    } else {
      console.log('✅ Profile insert successful');
      
      // Clean up test data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  }
}

fixDatabase();
