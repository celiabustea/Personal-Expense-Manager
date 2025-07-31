import React, { useMemo } from 'react';
import CurrencyDisplay from '../../atoms/CurrencyDisplay/CurrencyDisplay';

interface Transaction {
  id: string;
  amount: number;
  currency?: string;
}

interface CurrencyTransactionSummaryProps {
  transactions: Transaction[];
}

interface CurrencyTransactionData {
  currency: string;
  totalSpent: number;
  transactionCount: number;
}

const CurrencyTransactionSummary: React.FC<CurrencyTransactionSummaryProps> = ({ transactions }) => {
  const currencyTransactions = useMemo(() => {
    const transactionData: { [currency: string]: CurrencyTransactionData } = {};

    transactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only include expenses
        const currency = transaction.currency || 'USD';
        
        if (!transactionData[currency]) {
          transactionData[currency] = {
            currency,
            totalSpent: 0,
            transactionCount: 0
          };
        }

        transactionData[currency].totalSpent += Math.abs(transaction.amount);
        transactionData[currency].transactionCount += 1;
      }
    });

    return Object.values(transactionData).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [transactions]);

  const totalTransactions = transactions.length;

  if (currencyTransactions.length === 0) {
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
                USD
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#dc2626',
                backgroundColor: '#fecaca',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem'
              }}>
                0 expenses
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#000000' }}>
              $0.00
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

  if (currencyTransactions.length === 1) {
    // Single currency - use existing layout
    const transactionData = currencyTransactions[0];
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
                {transactionData.currency}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#dc2626',
                backgroundColor: '#fecaca',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem'
              }}>
                {transactionData.transactionCount} expenses
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#000000' }}>
              <CurrencyDisplay 
                amount={transactionData.totalSpent} 
                currency={transactionData.currency}
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
          {currencyTransactions.map(({ currency, totalSpent, transactionCount }) => (
            <div
              key={`spent-${currency}`}
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

export default CurrencyTransactionSummary;
