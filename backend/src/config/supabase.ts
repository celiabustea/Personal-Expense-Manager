import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvzzdgcfryhdhqaqqnif.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2enpkZ2NmcnloZGhxYXFxbmlmIiwi' +
    'cm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDk4NDAsImV4cCI6MjA2ODY4NTg0MH0.jWbKIk-ohnmD3RlhBPqmw0rpsrrJxwaaM9EcrACHV64';

// Create Supabase client for backend operations
export const supabase = createClient(supabaseUrl, supabaseKey);
