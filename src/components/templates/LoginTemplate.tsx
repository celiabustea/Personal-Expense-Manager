import React, { useState } from 'react';

interface LoginTemplateProps {
  onLogin: (formData: { email: string; password: string }) => void;
  onSignUp: (formData: { name: string; email: string; password: string }) => void;
  onGoogleSignIn?: () => void;
  loading?: boolean;
  error?: string | null;
}

const LoginTemplate: React.FC<LoginTemplateProps> = ({
  onLogin,
  onSignUp,
  onGoogleSignIn,
  loading = false,
  error = null,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp(formData);
    } else {
      onLogin({ email: formData.email, password: formData.password });
    }
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
              className="form-input"
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
            className="form-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="form-input"
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
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Login')}
          </button>
        </form>
        {onGoogleSignIn && (
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#fff',
              color: '#1e293b',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        )}
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
            onClick={toggleMode}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#1e293b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
              padding: 0,
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginTemplate;
