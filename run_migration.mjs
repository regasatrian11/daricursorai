// Script to run database migration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://dsxiymksrubpryxggyow.supabase.co';
const supabaseKey = 'sb_secret_kXfCKeXZcOH9K9qoPfmIuQ_HWTC1V0t';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Read migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/20250117000012_add_bio_to_profiles.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('🔄 Executing:', statement.substring(0, 50) + '...');
        
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('❌ Statement failed:', error);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Migration completed');
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

runMigration();
