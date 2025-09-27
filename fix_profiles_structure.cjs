const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dsxiymksrubpryxggyow.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGl5bWtzcnVicHJ5eGdneW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjI1MDYsImV4cCI6MjA3MzUzODUwNn0.jMnHpcZICTflmj9Kp5PuiWBDReWuBcv88O5SbwjUvDM'
);

async function fixProfilesTable() {
  console.log('🔧 Fixing profiles table structure...');
  
  try {
    // Test current table structure
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Current profiles table error:', testError.message);
    } else {
      console.log('✅ Profiles table accessible, current data:', testData);
    }
    
    console.log('💡 To fix the profiles table structure, run this SQL in Supabase SQL Editor:');
    console.log(`
      ALTER TABLE public.profiles ADD COLUMN user_id UUID;
      ALTER TABLE public.profiles 
      ADD CONSTRAINT fk_profiles_user_id 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    `);
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

fixProfilesTable();
