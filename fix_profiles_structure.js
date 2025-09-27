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
    
    // Try to add user_id column using direct SQL
    const { error: alterError } = await supabase.rpc('exec', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'user_id' AND table_schema = 'public'
          ) THEN
            ALTER TABLE public.profiles ADD COLUMN user_id UUID;
            ALTER TABLE public.profiles 
            ADD CONSTRAINT fk_profiles_user_id 
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to profiles table';
          ELSE
            RAISE NOTICE 'user_id column already exists in profiles table';
          END IF;
        END $$;
      `
    });
    
    if (alterError) {
      console.log('❌ Error adding user_id column:', alterError.message);
      console.log('💡 You may need to run this SQL manually in Supabase SQL Editor:');
      console.log(`
        ALTER TABLE public.profiles ADD COLUMN user_id UUID;
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
      `);
    } else {
      console.log('✅ Profiles table structure fixed!');
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

fixProfilesTable();
