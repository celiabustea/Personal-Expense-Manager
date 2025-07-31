import React from 'react';
import { useReports, ViewMode, BaseCurrency } from '../../../contexts/ReportsContext';
import { CURRENCIES } from '../../../utils/currencyUtils';

const ReportsHeader: React.FC = () => {
  const { baseCurrency, viewMode, setBaseCurrency, setViewMode, isLoading } = useReports();

  const currencies: BaseCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'RON'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.875rem',
          fontWeight: 700,
          color: '#1e293b'
        }}>
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
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>
              View Mode:
            </label>
            <div style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setViewMode('unified')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  backgroundColor: viewMode === 'unified' ? '#3b82f6' : '#ffffff',
                  color: viewMode === 'unified' ? '#ffffff' : '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🔄 Unified
              </button>
              <button
                onClick={() => setViewMode('native')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  backgroundColor: viewMode === 'native' ? '#3b82f6' : '#ffffff',
                  color: viewMode === 'native' ? '#ffffff' : '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🪙 Native
              </button>
            </div>
          </div>

          {/* Base Currency Selector - Only shown in unified mode */}
          {viewMode === 'unified' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>
                Display reports in:
              </label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as BaseCurrency)}
                disabled={isLoading}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
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
      <div style={{
        padding: '0.75rem',
        backgroundColor: viewMode === 'unified' ? '#dbeafe' : '#fef3c7',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        color: viewMode === 'unified' ? '#1e40af' : '#92400e'
      }}>
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
