// ========================================
// TEST DATABASE CONNECTION
// Run this in browser console after creating tables
// ========================================

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('user_posts')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful!');
    
    // Test all tables
    const tables = ['user_messages', 'user_conversations', 'character_chats', 'user_posts', 'post_interactions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          console.error(`❌ Table ${table} not found:`, error);
          return false;
        }
        
        console.log(`✅ Table ${table} exists`);
      } catch (error) {
        console.error(`❌ Error testing table ${table}:`, error);
        return false;
      }
    }

    console.log('✅ All tables are working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Run the test
testDatabase();
