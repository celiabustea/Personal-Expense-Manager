import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { DarkModeProvider } from '../src/contexts/DarkModeContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import '../src/styles/main.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Performance observer setup - client-side only, no logging to avoid hydration issues
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        // Performance monitoring without console output to prevent hydration mismatches
        const entries = list.getEntries();
        // Performance data available but not logged to avoid server/client differences
      });
      
      observer.observe({ type: 'navigation', buffered: true });
    }
  }, []);

  return (
    <Provider store={store}>
      <DarkModeProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </DarkModeProvider>
    </Provider>
  );
}

export default MyApp;
