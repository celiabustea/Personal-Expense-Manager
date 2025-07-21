import { supabase } from '../config/supabase';

async function listTables() {
  console.log('📋 Checking existing tables in your Supabase database...\n');

  try {
    // Query the information schema to get table names
    const { data, error } = await supabase.rpc('get_schema_tables');

    if (error) {
      console.log('⚠️  RPC function not available, trying alternative method...');

      // Try alternative method - check a few common table names
      const tablesToCheck = ['users', 'profiles', 'transactions', 'budgets', 'expenses'];

      for (const tableName of tablesToCheck) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (!tableError) {
            console.log(`✅ Table "${tableName}" exists`);
          } else if (tableError.code === 'PGRST116') {
            console.log(`❌ Table "${tableName}" does not exist`);
          } else {
            console.log(`⚠️  Table "${tableName}": ${tableError.message}`);
          }
        } catch (err) {
          console.log(`❌ Error checking table "${tableName}":`, err);
        }
      }
    } else {
      console.log('✅ Available tables:', data);
    }
  } catch (err) {
    console.error('❌ Error listing tables:', err);
  }
}

// Test creating a simple table structure
async function suggestTableSetup() {
  console.log('\n💡 Suggested table structure for your expense manager:\n');

  console.log('1. users/profiles table:');
  console.log('   - id (uuid, primary key)');
  console.log('   - email (text)');
  console.log('   - name (text)');
  console.log('   - created_at (timestamp)');

  console.log('\n2. transactions table:');
  console.log('   - id (uuid, primary key)');
  console.log('   - user_id (uuid, foreign key)');
  console.log('   - amount (numeric)');
  console.log('   - description (text)');
  console.log('   - category (text)');
  console.log('   - type (text) - "income" or "expense"');
  console.log('   - date (date)');
  console.log('   - created_at (timestamp)');

  console.log('\n3. budgets table:');
  console.log('   - id (uuid, primary key)');
  console.log('   - user_id (uuid, foreign key)');
  console.log('   - category (text)');
  console.log('   - amount (numeric)');
  console.log('   - period (text)');
  console.log('   - created_at (timestamp)');
}

async function runTableCheck() {
  await listTables();
  await suggestTableSetup();
}

if (require.main === module) {
  runTableCheck();
}

export { listTables, suggestTableSetup };
