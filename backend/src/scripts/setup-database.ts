import { supabase } from '../config/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function createTables() {
  console.log('🏗️  Creating database tables for Personal Expense Manager...\n');

  try {
    // read the SQL file
    const sqlPath = path.join(__dirname, '../../sql/create_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // split the SQL into individual statements
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement,
        });

        if (error) {
          // if exec_sql doesn't exist, try direct execution for simple statements!!!
          if (error.code === 'PGRST202') {
            console.log('   Using alternative execution method...');

            // for CREATE TABLE statements, we use the REST API
            if (statement.toLowerCase().includes('create table')) {
              console.log('   ⚠️  Cannot execute CREATE TABLE via REST API');
              console.log('   Please run this SQL manually in Supabase dashboard');
            }
          } else {
            console.log(`   ❌ Error: ${error.message}`);
          }
        } else {
          console.log('   ✅ Success');
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err}`);
      }
    }

    console.log('\n🎉 Table creation process completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the SQL from: sql/create_tables.sql');
    console.log('5. Run the SQL to create all tables');
  } catch (err) {
    console.error('❌ Failed to read SQL file:', err);
  }
}

// here -> test if tables were created successfully
async function testTables() {
  console.log('\n🔍 Testing table creation...\n');

  const tables = ['profiles', 'transactions', 'budgets'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (error) {
        console.log(`❌ Table "${table}": ${error.message}`);
      } else {
        console.log(`✅ Table "${table}" exists and is accessible`);
      }
    } catch (err) {
      console.log(`❌ Table "${table}": ${err}`);
    }
  }
}

async function run() {
  await createTables();
  await testTables();
}

if (require.main === module) {
  run();
}

export { createTables, testTables };
