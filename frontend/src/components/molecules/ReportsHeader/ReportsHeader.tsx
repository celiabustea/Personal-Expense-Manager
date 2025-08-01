import React, { useEffect, useState } from 'react';
import { useReports, ViewMode, BaseCurrency } from '../../../contexts/ReportsContext';
import { CURRENCIES } from '../../../utils/currencyUtils';

const ReportsHeader: React.FC = () => {
  const { baseCurrency, viewMode, setBaseCurrency, setViewMode, isLoading } = useReports();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currencies: BaseCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'RON'];

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark-mode') || 
                     document.body.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Create observer for class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Dark mode aware styles
  const getContainerStyle = () => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
    borderRadius: '0.5rem',
    border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`
  });

  const getHeadingStyle = () => ({
    margin: 0,
    fontSize: '1.875rem',
    fontWeight: 700,
    color: isDarkMode ? '#f8fafc' : '#1e293b'
  });

  const getLabelStyle = () => ({
    fontSize: '0.875rem',
    fontWeight: 500,
    color: isDarkMode ? '#94a3b8' : '#64748b'
  });

  const getButtonStyle = (isActive: boolean) => ({
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: isActive ? '#3b82f6' : (isDarkMode ? '#374151' : '#ffffff'),
    color: isActive ? '#ffffff' : (isDarkMode ? '#d1d5db' : '#64748b'),
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const getSelectStyle = () => ({
    padding: '0.5rem 1rem',
    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f8fafc' : '#1e293b',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1
  });

  const getButtonContainerStyle = () => ({
    display: 'flex',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    borderRadius: '0.375rem',
    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
    overflow: 'hidden'
  });

  const getDescriptionStyle = () => ({
    padding: '0.75rem',
    backgroundColor: viewMode === 'unified' 
      ? (isDarkMode ? '#1e3a8a' : '#dbeafe')
      : (isDarkMode ? '#78350f' : '#fef3c7'),
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: viewMode === 'unified' 
      ? (isDarkMode ? '#93c5fd' : '#1e40af')
      : (isDarkMode ? '#fbbf24' : '#92400e')
  });

  return (
    <div style={getContainerStyle()}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={getHeadingStyle()}>
          📊 Financial Reports
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={getLabelStyle()}>
              View Mode:
            </label>
            <div style={getButtonContainerStyle()}>
              <button
                onClick={() => setViewMode('unified')}
                style={getButtonStyle(viewMode === 'unified')}
              >
                🔄 Unified
              </button>
              <button
                onClick={() => setViewMode('native')}
                style={getButtonStyle(viewMode === 'native')}
              >
                🪙 Native
              </button>
            </div>
          </div>

          {/* Base Currency Selector - Only shown in unified mode */}
          {viewMode === 'unified' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={getLabelStyle()}>
                Display reports in:
              </label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as BaseCurrency)}
                disabled={isLoading}
                style={getSelectStyle()}
              >
                {currencies.map((currency) => {
                  const currencyInfo = CURRENCIES.find(c => c.code === currency);
                  return (
                    <option key={currency} value={currency}>
                      {currency} - {currencyInfo?.name} ({currencyInfo?.symbol})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Mode Description */}
      <div style={getDescriptionStyle()}>
        {viewMode === 'unified' ? (
          <>
            <strong>🔄 Unified View:</strong> All amounts converted to {baseCurrency} for consistent totals and charts.
            {isLoading && ' (Converting...)'}
          </>
        ) : (
          <>
            <strong>🪙 Native View:</strong> Each transaction and budget shown in its original currency. 
            Mixed-currency totals are shown separately per currency.
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsHeader;
