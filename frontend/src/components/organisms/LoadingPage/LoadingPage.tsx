

import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import loadingbg from '../../../assets/Financial Graph Loader(1).json';
import darkmodeloader from '../../../assets/dakrmodeloader.json';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const LoadingPage = () => {
  const lottieRef = useRef(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (lottieRef.current) {
      // @ts-ignore
      lottieRef.current.setSpeed(1.5);
    }
  }, []);

  const [visible, setVisible] = React.useState(false);
  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: darkMode ? '#1e293b' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        transition: 'transform 0.5s cubic-bezier(.77,0,.18,1)',
        transform: visible ? 'translateX(0)' : 'translateX(100vw)',
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={darkMode ? darkmodeloader : loadingbg}
        loop
        autoplay
        style={{
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default LoadingPage;