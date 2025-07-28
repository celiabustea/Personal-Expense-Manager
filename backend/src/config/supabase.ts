import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase: any = null;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase configuration missing. SUPABASE_URL or SUPABASE_KEY not found in environment variables.');
  // Create a mock client or handle this case appropriately
  supabase = null;
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };