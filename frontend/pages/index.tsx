import React from 'react';
import { useRouter } from 'next/router';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import LoginTemplate from '../src/components/templates/LoginTemplate';

function IndexPage() {
  const router = useRouter();
  const { resetDarkMode } = useDarkMode();

  const handleLogin = (formData: { email: string; password: string }) => {
    // Reset dark mode on login
    resetDarkMode();
    
    // Here you would normally validate credentials with your backend
    // For now, just redirect to dashboard immediately
    router.push('/dashboard');
  };

  const handleSignUp = (formData: { name: string; email: string; password: string }) => {
    console.log('Sign up with:', formData);
    // Reset dark mode on sign up
    resetDarkMode();
    
    // Here you would normally create account with your backend
    // For now, just redirect to dashboard
    router.push('/dashboard');
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign-in clicked');
    // Reset dark mode on Google sign in
    resetDarkMode();
    
    // Here you would integrate with Google OAuth
    // For now, just redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <LoginTemplate
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
      loading={false}
      error={null}
    />
  );
}

export default IndexPage;
