import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug: Check if environment variables are loaded
console.log('🔧 Supabase config:', {
  url: supabaseUrl ? '✅ Set' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
  urlPrefix: supabaseUrl?.substring(0, 20) + '...'
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('Expected variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signUp = async (email: string, password: string, name: string) => {
  console.log('🔄 Starting safe signUp process...');
  
  try {
    const result = await safeAuthCall(() => 
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
    );
    
    console.log('✅ Safe signUp completed:', result);
    return result;
    
  } catch (err: any) {
    console.error('🚨 Final catch in signUp:', err);
    return {
      data: null,
      error: {
        message: 'Sign up failed',
        name: 'AuthError'
      }
    };
  }
}

// Helper function to safely call Supabase auth methods without throwing errors
const safeAuthCall = async (authMethod: () => Promise<any>): Promise<{ data: any; error: any }> => {
  return new Promise((resolve) => {
    // Use requestIdleCallback or setTimeout to ensure error isolation
    const executeAuth = () => {
      try {
        // Execute the auth method and handle the promise
        authMethod()
          .then((result: any) => {
            resolve(result);
          })
          .catch((error: any) => {
            // Convert any thrown error to our standard format
            console.log('�️ Caught auth error in safeAuthCall:', error);
            resolve({
              data: null,
              error: {
                message: 'Invalid login credentials',
                name: 'AuthError'
              }
            });
          });
      } catch (syncError: any) {
        // Catch synchronous errors
        console.log('🛡️ Caught sync error in safeAuthCall:', syncError);
        resolve({
          data: null,
          error: {
            message: 'Invalid login credentials',
            name: 'AuthError'
          }
        });
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(executeAuth);
    } else {
      setTimeout(executeAuth, 0);
    }
  });
};

export const signIn = async (email: string, password: string) => {
  console.log('🔄 Starting safe signIn process...');
  
  try {
    const result = await safeAuthCall(() => 
      supabase.auth.signInWithPassword({
        email,
        password,
      })
    );
    
    console.log('✅ Safe signIn completed:', result);
    return result;
    
  } catch (err: any) {
    console.error('🚨 Final catch in signIn:', err);
    return {
      data: null,
      error: {
        message: 'Invalid login credentials',
        name: 'AuthError'
      }
    };
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}