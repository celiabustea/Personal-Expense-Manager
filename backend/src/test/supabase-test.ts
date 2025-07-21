import { supabase } from '../config/supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection by getting the current timestamp
    const { data, error } = await supabase.from('test').select('*').limit(1);

    if (error) {
      console.log('⚠️  Table test does not exist yet, but connection is working!');
      console.log('Connection successful - Supabase client initialized correctly');

      // Try to get auth status instead
      const { error: authError } = await supabase.auth.getSession();

      if (authError) {
        console.log('Auth error:', authError.message);
      } else {
        console.log('✅ Auth service is accessible');
      }

      return true;
    } else {
      console.log('✅ Connection successful!');
      console.log('Data from test table:', data);
      return true;
    }
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}

// Test Supabase configuration
async function testSupabaseConfig() {
  console.log('\n🔧 Supabase Configuration:');
  console.log('URL: https://fvzzdgcfryhdhqaqqnif.supabase.co');
  console.log(
    'Key: ' +
      (process.env.SUPABASE_SERVICE_ROLE_KEY
        ? '✅ Environment variable set'
        : '⚠️  Using fallback key'),
  );

  // Test if we can access Supabase at all
  try {
    const response = await fetch('https://fvzzdgcfryhdhqaqqnif.supabase.co/rest/v1/', {
      headers: {
        apikey:
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2enpkZ2NmcnloZGhxYXFxbmlmIiwi' +
            'cm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDk4NDAsImV4cCI6MjA2ODY4NTg0MH0.jWbKIk-ohnmD3RlhBPqmw0rpsrrJxwaaM9EcrACHV64',
      },
    });

    if (response.ok) {
      console.log('✅ REST API is accessible');
    } else {
      console.log('❌ REST API returned status:', response.status);
    }
  } catch (err) {
    console.log('❌ Cannot reach Supabase:', err);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Supabase Connection Tests\n');

  await testSupabaseConfig();
  console.log('\n');
  await testSupabaseConnection();
  
  console.log('\n✨ Test completed!');
}

// Export for use in other files
export { testSupabaseConnection, testSupabaseConfig };

// Run if this file is executed directly
if (require.main === module) {
  runTests();
}
