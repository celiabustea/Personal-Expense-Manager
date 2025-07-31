import React, { useMemo } from 'react';
import CurrencyDisplay from '../../atoms/CurrencyDisplay/CurrencyDisplay';

interface Transaction {
  id: string;
  amount: number;
  currency?: string;
}

interface CurrencySpendingSummaryProps {
  transactions: Transaction[];
}

interface CurrencySpending {
  currency: string;
  totalSpent: number;
  transactionCount: number;
}

const CurrencySpendingSummary: React.FC<CurrencySpendingSummaryProps> = ({ transactions }) => {
  const currencySpending = useMemo(() => {
    const spending: { [currency: string]: CurrencySpending } = {};

    transactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only include expenses
        const currency = transaction.currency || 'USD';
        
        if (!spending[currency]) {
          spending[currency] = {
            currency,
            totalSpent: 0,
            transactionCount: 0
          };
        }

        spending[currency].totalSpent += Math.abs(transaction.amount);
        spending[currency].transactionCount += 1;
      }
    });

    return Object.values(spending).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [transactions]);

  const totalTransactions = transactions.length;

  if (currencySpending.length === 0) {
    return (
      <div className="transactions-summary">
        <div className="summary-card">
          <h3>Total Spent by Currency</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.375rem',
            border: '1px solid #e2e8f0',
            marginTop: '0.5rem',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            No expenses yet
          </div>
        </div>
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <p>{totalTransactions}</p>
        </div>
      </div>
    );
  }

  if (currencySpending.length === 1) {
    // Single currency - use existing layout
    const spending = currencySpending[0];
    return (
      <div className="transactions-summary">
        <div className="summary-card">
          <h3>Total Spent by Currency</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.375rem',
            border: '1px solid #fecaca',
            marginTop: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#000000'
              }}>
                {spending.currency}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#dc2626',
                backgroundColor: '#fecaca',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem'
              }}>
                {spending.transactionCount} expenses
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#000000' }}>
              <CurrencyDisplay 
                amount={spending.totalSpent} 
                currency={spending.currency}
                showCurrencyTag={false}
              />
            </div>
          </div>
        </div>
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <p>{totalTransactions}</p>
        </div>
      </div>
    );
  }

  // Multiple currencies - show per-currency breakdown
  return (
    <div className="transactions-summary">
      {/* Multi-currency spending summary */}
      <div className="summary-card multi-currency">
        <h3>Total Spent by Currency</h3>
        <div style={{
          display: 'grid',
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}>
          {currencySpending.map(({ currency, totalSpent, transactionCount }) => (
            <div
              key={currency}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#fef2f2',
                borderRadius: '0.375rem',
                border: '1px solid #fecaca'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#000000'
                }}>
                  {currency}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#dc2626',
                  backgroundColor: '#fecaca',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem'
                }}>
                  {transactionCount} expenses
                </span>
              </div>
              <div style={{ fontWeight: 600, color: '#000000' }}>
                <CurrencyDisplay 
                  amount={totalSpent} 
                  currency={currency}
                  showCurrencyTag={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="summary-card">
        <h3>Total Transactions</h3>
        <p>{totalTransactions}</p>
      </div>
    </div>
  );
};

export default CurrencySpendingSummary;
