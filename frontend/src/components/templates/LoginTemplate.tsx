
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Lottie from 'lottie-react';
// @ts-ignore
import loginbg from '../../assets/loginbg.json';
// import { useLoading } from '../../contexts/LoadingContext';

interface LoginTemplateProps {
  onLogin?: (formData: { email: string; password: string }) => void;
  onSignUp?: (formData: { name: string; email: string; password: string }) => void;
  onGoogleSignIn?: () => void;
  loading?: boolean;
  error?: string | null;
}

const LoginTemplate: React.FC<LoginTemplateProps> = () => {
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  // const { loading, setLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Force light mode on login page
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    
    // Cleanup when component unmounts - restore dark mode if it was enabled
    return () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode === 'true') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      }
    };
  }, []);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          setError(error.message);
          setLoading(false);
        } else {
          router.push('/dashboard');
        }
      } else {
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
          setLoading(false);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!mounted) {
    return null;
  }
  const toggleMode = () => {
    setIsSignUp(prev => !prev);
    setError(null);
    setFormData({
      name: '',
      email: '',
      password: ''
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 0
    }}>
      <Lottie
        animationData={loginbg}
        loop
        autoplay
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          margin: 0,
          padding: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: 'none',
          transform: 'scale(1.2)',
          transformOrigin: 'center center',
        }}
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '10vw',
        transform: 'translateY(-50%)',
        zIndex: 2,
        color: '#1e293b',
        fontSize: '22px',
        fontWeight: 700,
        textAlign: 'left',
        background: 'none',
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        minWidth: '350px',
        maxWidth: '400px',
      }}>
        <div style={{ marginBottom: '18px' }}>
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                backgroundColor: '#ffffff',
                color: '#1e293b'
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
              fontFamily: 'inherit',
              backgroundColor: '#ffffff',
              color: '#1e293b'
            }}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}
            />
            <span
              onClick={() => setShowPassword(prev => !prev)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
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
