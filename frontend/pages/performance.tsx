import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const PerformanceTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalTime = console.time;
    const originalTimeEnd = console.timeEnd;
    const originalWarn = console.warn;
    const originalError = console.error;

    const capturedLogs: string[] = [];

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('📊') || message.includes('🔐') || message.includes('🚀') || message.includes('⚡') || message.includes('🔄')) {
        capturedLogs.push(`[LOG] ${message}`);
        setLogs([...capturedLogs]);
      }
      originalLog(...args);
    };

    console.time = (label) => {
      if (label && (label.includes('📊') || label.includes('🔐') || label.includes('🚀'))) {
        capturedLogs.push(`[TIME START] ${label}`);
        setLogs([...capturedLogs]);
      }
      originalTime(label);
    };

    console.timeEnd = (label) => {
      if (label && (label.includes('📊') || label.includes('🔐') || label.includes('🚀'))) {
        capturedLogs.push(`[TIME END] ${label}`);
        setLogs([...capturedLogs]);
      }
      originalTimeEnd(label);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('🔴') || message.includes('🟡') || message.includes('🟢')) {
        capturedLogs.push(`[WARN] ${message}`);
        setLogs([...capturedLogs]);
      }
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.time = originalTime;
      console.timeEnd = originalTimeEnd;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const simulateSlowLoad = () => {
    console.log('🔄 Simulating slow component load...');
    setTimeout(() => {
      console.log('⚡ Slow component loaded after 2 seconds');
    }, 2000);
  };

  const testNavigation = () => {
    router.push('/dashboard');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Performance Monitoring Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testNavigation} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Navigate to Dashboard
        </button>
        <button onClick={simulateSlowLoad} style={{ padding: '10px 20px' }}>
          Simulate Slow Load
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #ddd'
      }}>
        <h3>Performance Logs:</h3>
        {logs.length === 0 ? (
          <p>No performance logs captured yet. Navigate to dashboard to see timing data.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {logs.map((log, index) => (
              <li key={index} style={{ 
                padding: '4px 0', 
                borderBottom: '1px solid #eee',
                color: log.includes('[WARN]') ? '#ff6b35' : log.includes('[TIME') ? '#4a90e2' : '#333'
              }}>
                {log}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>🔍 This page monitors performance logs. Open browser DevTools Console for detailed timing information.</p>
        <p>📊 Performance metrics include component render times, selector execution, and navigation timing.</p>
      </div>
    </div>
  );
};

export default PerformanceTest;
