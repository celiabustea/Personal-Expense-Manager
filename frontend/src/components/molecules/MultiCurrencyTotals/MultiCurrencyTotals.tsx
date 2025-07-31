import React, { useMemo, useState, useEffect } from 'react';
import { useReports } from '../../../contexts/ReportsContext';
import CurrencyDisplay from '../../atoms/CurrencyDisplay/CurrencyDisplay';

interface Transaction {
  id: string;
  amount: number;
  currency?: string;
  originalAmount?: number;
  originalCurrency?: string;
}

interface Budget {
  id: string;
  amount: number;
  spent: number;
  currency?: string;
}

interface MultiCurrencyTotalsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

interface CurrencyTotal {
  currency: string;
  totalSpending: number;
  totalIncome: number;
  netIncome: number;
  budgetTotal: number;
  budgetSpent: number;
  budgetRemaining: number;
}

const MultiCurrencyTotals: React.FC<MultiCurrencyTotalsProps> = ({
  transactions,
  budgets
}) => {
  const { viewMode, baseCurrency, convertToBaseCurrency } = useReports();
  const [unifiedTotals, setUnifiedTotals] = useState({
    totalSpending: 0,
    totalIncome: 0,
    netIncome: 0,
    budgetTotal: 0,
    budgetSpent: 0,
    budgetRemaining: 0
  });

  // Calculate unified totals with real currency conversion
  useEffect(() => {
    if (viewMode === 'unified') {
      const calculateUnifiedTotals = async () => {
        try {
          // Convert transaction amounts
          const transactionAmounts = await Promise.all(
            transactions.map(async (transaction) => {
              const currency = transaction.currency || 'USD';
              const convertedAmount = await convertToBaseCurrency(Math.abs(transaction.amount), currency);
              return {
                spending: transaction.amount < 0 ? convertedAmount : 0,
                income: transaction.amount > 0 ? convertedAmount : 0,
                net: transaction.amount < 0 ? -convertedAmount : convertedAmount
              };
            })
          );

          // Convert budget amounts
          const budgetAmounts = await Promise.all(
            budgets.map(async (budget) => {
              const currency = budget.currency || 'USD';
              const convertedTotal = await convertToBaseCurrency(budget.amount, currency);
              const convertedSpent = await convertToBaseCurrency(budget.spent || 0, currency);
              return {
                total: convertedTotal,
                spent: convertedSpent,
                remaining: convertedTotal - convertedSpent
              };
            })
          );

          // Sum up converted amounts
          const totals = {
            totalSpending: transactionAmounts.reduce((sum, t) => sum + t.spending, 0),
            totalIncome: transactionAmounts.reduce((sum, t) => sum + t.income, 0),
            netIncome: transactionAmounts.reduce((sum, t) => sum + t.net, 0),
            budgetTotal: budgetAmounts.reduce((sum, b) => sum + b.total, 0),
            budgetSpent: budgetAmounts.reduce((sum, b) => sum + b.spent, 0),
            budgetRemaining: budgetAmounts.reduce((sum, b) => sum + b.remaining, 0)
          };

          setUnifiedTotals(totals);
        } catch (error) {
          console.error('Error calculating unified totals:', error);
        }
      };

      calculateUnifiedTotals();
    }
  }, [viewMode, baseCurrency, transactions, budgets, convertToBaseCurrency]);

  const currencyTotals = useMemo(() => {
    const totals: { [currency: string]: CurrencyTotal } = {};

    // Process transactions
    transactions.forEach(transaction => {
      const currency = transaction.currency || 'USD';
      
      if (!totals[currency]) {
        totals[currency] = {
          currency,
          totalSpending: 0,
          totalIncome: 0,
          netIncome: 0,
          budgetTotal: 0,
          budgetSpent: 0,
          budgetRemaining: 0
        };
      }

      if (transaction.amount < 0) {
        totals[currency].totalSpending += Math.abs(transaction.amount);
      } else {
        totals[currency].totalIncome += transaction.amount;
      }
      totals[currency].netIncome += transaction.amount;
    });

    // Process budgets
    budgets.forEach(budget => {
      const currency = budget.currency || 'USD';
      
      if (!totals[currency]) {
        totals[currency] = {
          currency,
          totalSpending: 0,
          totalIncome: 0,
          netIncome: 0,
          budgetTotal: 0,
          budgetSpent: 0,
          budgetRemaining: 0
        };
      }

      totals[currency].budgetTotal += budget.amount;
      totals[currency].budgetSpent += budget.spent || 0;
      totals[currency].budgetRemaining += (budget.amount - (budget.spent || 0));
    });

    return totals;
  }, [transactions, budgets]);

  const currencies = Object.keys(currencyTotals).sort();

  if (viewMode === 'unified') {
    // In unified mode, show converted totals using real exchange rates
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Total Spending (Converted to {baseCurrency})
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#dc2626' }}>
            <CurrencyDisplay
              amount={unifiedTotals.totalSpending}
              currency={baseCurrency}
              size="large"
              showCurrencyTag={false}
            />
          </div>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Total Income (Converted to {baseCurrency})
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#16a34a' }}>
            <CurrencyDisplay
              amount={unifiedTotals.totalIncome}
              currency={baseCurrency}
              size="large"
              showCurrencyTag={false}
            />
          </div>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Net Income (Converted to {baseCurrency})
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: unifiedTotals.netIncome >= 0 ? '#16a34a' : '#dc2626'
          }}>
            <CurrencyDisplay
              amount={unifiedTotals.netIncome}
              currency={baseCurrency}
              size="large"
              showCurrencyTag={false}
            />
          </div>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Total Budgeted ({baseCurrency})
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
            <CurrencyDisplay
              amount={unifiedTotals.budgetTotal}
              currency={baseCurrency}
              size="large"
              showCurrencyTag={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Native mode - show per-currency totals with transaction and budget summaries
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ 
        marginBottom: '1rem', 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        color: '#1e293b' 
      }}>
        📊 Per-Currency Financial Summary
      </h3>
      
      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        {currencies.map(currency => {
          const total = currencyTotals[currency];
          return (
            <div
              key={currency}
              style={{
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                border: '2px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#1e293b' 
                }}>
                  {currency} Financial Summary
                </h4>
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  Native Currency
                </span>
              </div>

              {/* Transaction Summary */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ 
                  margin: '0 0 0.75rem 0', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.5rem'
                }}>
                  💳 Transaction Totals for {currency}
                </h5>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Total Spending
                    </div>
                    <CurrencyDisplay
                      amount={total.totalSpending}
                      currency={currency}
                      showCurrencyTag={false}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Total Income
                    </div>
                    <CurrencyDisplay
                      amount={total.totalIncome}
                      currency={currency}
                      showCurrencyTag={false}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Net Income
                    </div>
                    <CurrencyDisplay
                      amount={total.netIncome}
                      currency={currency}
                      showCurrencyTag={false}
                    />
                  </div>
                </div>
              </div>

              {/* Budget Summary */}
              <div>
                <h5 style={{ 
                  margin: '0 0 0.75rem 0', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.5rem'
                }}>
                  💰 Budget Totals for {currency}
                </h5>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Total Budgeted
                    </div>
                    <CurrencyDisplay
                      amount={total.budgetTotal}
                      currency={currency}
                      showCurrencyTag={false}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Total Spent
                    </div>
                    <CurrencyDisplay
                      amount={total.budgetSpent}
                      currency={currency}
                      showCurrencyTag={false}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Budget Remaining
                    </div>
                    <CurrencyDisplay
                      amount={total.budgetRemaining}
                      currency={currency}
                      showCurrencyTag={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currencies.length > 1 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          <strong>💡 Tip:</strong> Switch to "Unified View" to see all totals converted to {baseCurrency} for easier comparison.
        </div>
      )}
    </div>
  );
};

export default MultiCurrencyTotals;
