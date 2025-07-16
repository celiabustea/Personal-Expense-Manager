import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { DarkModeProvider } from '../src/contexts/DarkModeContext';
import '../src/styles/main.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('🚀 App component mounted!');
    
    // Performance observer to track navigation timing
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('⚡ Navigation Performance:');
            console.log(`- DNS lookup: ${navEntry.domainLookupEnd - navEntry.domainLookupStart}ms`);
            console.log(`- TCP connection: ${navEntry.connectEnd - navEntry.connectStart}ms`);
            console.log(`- Request/Response: ${navEntry.responseEnd - navEntry.requestStart}ms`);
            console.log(`- DOM loading: ${navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart}ms`);
            console.log(`- Total page load: ${navEntry.loadEventEnd - navEntry.fetchStart}ms`);
          }
        });
      });
      
      observer.observe({ type: 'navigation', buffered: true });
    }
  }, []);

  return (
    <Provider store={store}>
      <DarkModeProvider>
        <Component {...pageProps} />
      </DarkModeProvider>
    </Provider>
  );
}

export default MyApp;
