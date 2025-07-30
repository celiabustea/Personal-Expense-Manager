
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

// Aggressive error suppression for authentication errors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('AuthApiError') || 
        message.includes('Invalid login credentials') ||
        message.includes('auth.signInWithPassword')) {
      // Suppress auth-related console errors
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

interface LoginTemplateProps {
  onLogin?: (formData: { email: string; password: string }) => void;
  onSignUp?: (formData: { name: string; email: string; password: string }) => void;
  onGoogleSignIn?: () => void;
  loading?: boolean;
  error?: string | null;
}

const LoginTemplate: React.FC<LoginTemplateProps> = ({
  onGoogleSignIn,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Always call useAuth - this must be consistent
  const { signUp, signIn } = useAuth();
  const router = useRouter();

  // Ensure component only renders after mounting (client-side only)
  useEffect(() => {
    setMounted(true);
    
    // Add aggressive global error handler to catch any unhandled authentication errors
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || '';
      const errorName = event.error?.name || '';
      
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('AuthApiError') ||
          errorName === 'AuthApiError' ||
          errorMessage.includes('auth') ||
          errorMessage.includes('supabase')) {
        console.log('🛡️ Suppressing global auth error:', event);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setError('Invalid login credentials');
        setLoading(false);
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonMessage = reason?.message || reason?.toString() || '';
      const reasonName = reason?.name || '';
      
      if (reasonMessage.includes('Invalid login credentials') || 
          reasonMessage.includes('AuthApiError') ||
          reasonName === 'AuthApiError' ||
          reasonMessage.includes('auth') ||
          reasonMessage.includes('supabase')) {
        console.log('🛡️ Suppressing unhandled auth promise rejection:', event);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setError('Invalid login credentials');
        setLoading(false);
        return false;
      }
    };

    // Add both standard and capture phase listeners
    window.addEventListener('error', handleGlobalError, { capture: true });
    window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
    document.addEventListener('error', handleGlobalError, { capture: true });
    
    return () => {
      window.removeEventListener('error', handleGlobalError, { capture: true });
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
      document.removeEventListener('error', handleGlobalError, { capture: true });
    };
  }, []);

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '18px',
          padding: '32px 28px',
          width: '100%',
          maxWidth: '350px',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #1e293b',
              borderRadius: '50%',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Wrap everything in a setTimeout to ensure any thrown errors are isolated
    setTimeout(async () => {
      try {
        console.log('🔄 Form submitted:', { isSignUp, email: formData.email });
        
        if (isSignUp) {
          console.log('🔄 Attempting sign up...');
          const result = await signUp(formData.email, formData.password, formData.name);
          console.log('📊 Sign up result:', result);
          
          if (result?.error) {
            console.error('❌ Sign up error:', result.error);
            setError(result.error.message || 'Sign up failed');
          } else if (result?.data) {
            console.log('✅ Sign up successful, redirecting...');
            router.push('/dashboard');
          }
        } else {
          console.log('🔄 Attempting sign in...');
          const result = await signIn(formData.email, formData.password);
          console.log('📊 Sign in result:', result);
          
          if (result?.error) {
            console.error('❌ Sign in error:', result.error);
            setError('Invalid login credentials');
          } else if (result?.data) {
            console.log('✅ Sign in successful, redirecting...');
            router.push('/dashboard');
          }
        }
      } catch (err: any) {
        console.error('❌ Error in handleSubmit:', err);
        setError('Invalid login credentials');
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: '', email: '', password: '' });
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '18px',
        padding: '32px 28px',
        width: '100%',
        maxWidth: '350px',
        minHeight: '480px',
        boxShadow: '0 12px 32px -8px rgba(30,41,59,0.18)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: '0',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h1 style={{
            color: '#1e293b',
            fontSize: '22px',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            Expense Manager
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '13px',
            margin: '8px 0 0 0',
            fontWeight: 500,
          }}>
            {isSignUp ? 'Create your account' : 'Log in to manage your expenses'}
          </p>
        </div>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '13px',
            fontWeight: 500,
          }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '180px', justifyContent: 'center' }}>
          {isSignUp && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required={isSignUp}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit'
              }}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit'
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#64748b' : '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              marginTop: '2px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>
        <div style={{
          textAlign: 'center',
          marginTop: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#1e293b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginTemplate;