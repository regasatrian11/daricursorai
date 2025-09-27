// Script to run database migration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dsxiymksrubpryxggyow.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGl5bWtzcnVicHJ5eGdneW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NzQ4NzMsImV4cCI6MjA1MDE1MDg3M30.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Read migration file
    const fs = require('fs');
    const migrationSQL = fs.readFileSync('supabase/migrations/20250117000011_quick_fix_database.sql', 'utf8');
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
    } else {
      console.log('✅ Migration completed successfully');
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

runMigration();
