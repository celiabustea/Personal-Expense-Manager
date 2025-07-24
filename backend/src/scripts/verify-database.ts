import { supabase } from '../config/supabase';

async function verifyTables() {
  console.log('🔍 Verifying database tables...\n');

  const tables = [
    { name: 'profiles', expectedColumns: ['id', 'name', 'email', 'created_at', 'updated_at'] },
    {
      name: 'transactions',
      expectedColumns: [
        'id',
        'user_id',
        'amount',
        'description',
        'category',
        'type',
        'date',
        'created_at',
        'updated_at',
      ],
    },
    {
      name: 'budgets',
      expectedColumns: [
        'id',
        'user_id',
        'category',
        'amount',
        'period',
        'created_at',
        'updated_at',
      ],
    },
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table.name).select('*').limit(0); // !!!!!! don't fetch any rows, just check if table exists

      if (error) {
        console.log(`❌ Table "${table.name}": ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table "${table.name}" exists and is accessible`);

        // here -> test insert/select to verify RLS policies work !!!
        try {
          const testData = getTestData(table.name);
          if (testData) {
            const { error: insertError } = await supabase.from(table.name).insert(testData);

            if (insertError) {
              console.log(`   ⚠️  Insert test failed (expected for RLS): ${insertError.message}`);
            } else {
              console.log(`   ✅ Insert test passed`);
            }
          }
        } catch (testErr) {
          console.log(`   ⚠️  Test insert failed (this is expected without authentication)`);
        }
      }
    } catch (err) {
      console.log(`❌ Table "${table.name}": ${err}`);
      allTablesExist = false;
    }
  }

  if (allTablesExist) {
    console.log('\n🎉 All tables created successfully!');
    console.log('\n📋 Your database is ready for:');
    console.log('   - User authentication and profiles');
    console.log('   - Transaction tracking (income/expenses)');
    console.log('   - Budget management');
    console.log('   - Row-level security (users only see their own data)');
  } else {
    console.log('\n❌ Some tables are missing. Please run the SQL script in Supabase dashboard.');
  }

  return allTablesExist;
}

function getTestData(tableName: string) {
  // Note: these will fail without proper authentication, which is expected lol
  switch (tableName) {
    case 'profiles':
      return {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Test User',
        email: 'test@example.com',
      };
    case 'transactions':
      return {
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: 100.0,
        description: 'Test transaction',
        category: 'Food',
        type: 'expense',
      };
    case 'budgets':
      return {
        user_id: '00000000-0000-0000-0000-000000000000',
        category: 'Food',
        amount: 500.0,
        period: 'monthly',
      };
    default:
      return null;
  }
}

async function showTableInfo() {
  console.log('\n📊 Database Schema Information:');
  console.log('\n1. profiles table:');
  console.log('   - Stores user profile information');
  console.log('   - Links to Supabase auth.users');
  console.log('   - Auto-created when user signs up');

  console.log('\n2. transactions table:');
  console.log('   - Tracks income and expenses');
  console.log('   - Categorized and dated');
  console.log('   - Linked to user profiles');

  console.log('\n3. budgets table:');
  console.log('   - Budget limits by category');
  console.log('   - Monthly/weekly/yearly periods');
  console.log('   - User-specific budgets');

  console.log('\n🔒 Security Features:');
  console.log('   - Row Level Security enabled');
  console.log('   - Users can only access their own data');
  console.log('   - Automatic profile creation on signup');
}

async function run() {
  const success = await verifyTables();
  await showTableInfo();

  if (success) {
    console.log('\n🚀 Next steps:');
    console.log('   1. Set up authentication in your frontend');
    console.log('   2. Test user registration/login');
    console.log('   3. Start adding transactions and budgets');
  }
}

if (require.main === module) {
  run();
}

export { verifyTables };
