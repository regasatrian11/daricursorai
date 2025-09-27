// Script to create RPC functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsxiymksrubpryxggyow.supabase.co';
const supabaseKey = 'sb_secret_kXfCKeXZcOH9K9qoPfmIuQ_HWTC1V0t';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRPCFunctions() {
  try {
    console.log('🔄 Creating RPC functions...');
    
    // Test if we can call RPC functions
    const { data, error } = await supabase.rpc('update_user_bio', { new_bio: 'test' });
    
    if (error) {
      console.log('❌ RPC function update_user_bio does not exist');
      console.log('💡 Please create this function in your Supabase dashboard:');
      console.log(`
CREATE OR REPLACE FUNCTION update_user_bio(new_bio TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get current user ID
    user_id := auth.uid();
    
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update or insert profile with bio
    INSERT INTO profiles (id, bio, updated_at)
    VALUES (user_id, new_bio, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        bio = EXCLUDED.bio,
        updated_at = EXCLUDED.updated_at;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
    } else {
      console.log('✅ RPC function update_user_bio exists');
    }
    
  } catch (error) {
    console.error('❌ Error checking RPC functions:', error);
  }
}

createRPCFunctions();
