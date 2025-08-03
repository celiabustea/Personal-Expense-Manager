

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { DarkModeProvider } from '../src/contexts/DarkModeContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import '../src/styles/main.css';
import '../src/styles/pages/Login.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import LoadingPage from '../src/components/organisms/LoadingPage/LoadingPage';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <DarkModeProvider>
        <AuthProvider>
          <AppContent Component={Component} pageProps={pageProps} />
        </AuthProvider>
      </DarkModeProvider>
    </Provider>
  );
}

function AppContent({ Component, pageProps }: any) {
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setRouteLoading(true);
    const handleStop = () => setRouteLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  return (
    <>
      {routeLoading && <LoadingPage />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
