import React, { useMemo } from 'react';
import CurrencyDisplay from '../../atoms/CurrencyDisplay/CurrencyDisplay';

interface Budget {
  id: string;
  amount: number;
  spent: number;
  currency?: string;
}

interface CurrencyBudgetSummaryProps {
  budgets: Budget[];
}

interface CurrencyBudgetData {
  currency: string;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  budgetCount: number;
}

const CurrencyBudgetSummary: React.FC<CurrencyBudgetSummaryProps> = ({ budgets }) => {
  const currencyBudgets = useMemo(() => {
    const budgetData: { [currency: string]: CurrencyBudgetData } = {};

    budgets.forEach(budget => {
      const currency = budget.currency || 'USD';
      
      if (!budgetData[currency]) {
        budgetData[currency] = {
          currency,
          totalBudgeted: 0,
          totalSpent: 0,
          totalRemaining: 0,
          budgetCount: 0
        };
      }

      budgetData[currency].totalBudgeted += budget.amount;
      budgetData[currency].totalSpent += budget.spent || 0;
      budgetData[currency].totalRemaining += (budget.amount - (budget.spent || 0));
      budgetData[currency].budgetCount += 1;
    });

    return Object.values(budgetData).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [budgets]);

  if (currencyBudgets.length === 0) {
    return (
      <div className="budgets-summary">
        <div className="summary-card">
          <h3>Total Budgeted by Currency</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.375rem',
            border: '1px solid #bae6fd',
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
                color: '#0369a1',
                backgroundColor: '#bae6fd',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem'
              }}>
                0 budgets
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#000000' }}>
              $0.00
            </div>
          </div>
        </div>
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
                0 budgets
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#000000' }}>
              $0.00
            </div>
          </div>
        </div>
        <div className="summary-card">
          <h3>Total Budgets</h3>
          <p>0</p>
        </div>
      </div>
    );
  }

  if (currencyBudgets.length === 1) {
    // Single currency - use existing layout
    const budgetData = currencyBudgets[0];
    return (
      <div className="budgets-summary">
        <div className="summary-card">
          <h3>Total Budgeted by Currency</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.375rem',
            border: '1px solid #bae6fd',
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
                {budgetData.currency}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#0369a1',
                backgroundColor: '#bae6fd',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem'
              }}>
                {budgetData.budgetCount} budgets
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#000000' }}>
              <CurrencyDisplay 
                amount={budgetData.totalBudgeted} 
                currency={budgetData.currency}
                showCurrencyTag={false}
              />
            </div>
          </div>
        </div>
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
                {budgetData.currency}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#dc2626',
                backgroundColor: '#fecaca',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem'
              }}>
                {budgetData.budgetCount} budgets
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#000000' }}>
              <CurrencyDisplay 
                amount={budgetData.totalSpent} 
                currency={budgetData.currency}
                showCurrencyTag={false}
              />
            </div>
          </div>
        </div>
        <div className="summary-card">
          <h3>Total Budgets</h3>
          <p>{budgetData.budgetCount}</p>
        </div>
      </div>
    );
  }

  // Multiple currencies - show per-currency breakdown
  return (
    <div className="budgets-summary">
      {/* Multi-currency budget summary */}
      <div className="summary-card multi-currency">
        <h3>Total Budgeted by Currency</h3>
        <div style={{
          display: 'grid',
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}>
          {currencyBudgets.map(({ currency, totalBudgeted, budgetCount }) => (
            <div
              key={`budgeted-${currency}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '0.375rem',
                border: '1px solid #bae6fd'
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
                  color: '#0369a1',
                  backgroundColor: '#bae6fd',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem'
                }}>
                  {budgetCount} budgets
                </span>
              </div>
              <div style={{ fontWeight: 600, color: '#000000' }}>
                <CurrencyDisplay 
                  amount={totalBudgeted} 
                  currency={currency}
                  showCurrencyTag={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Multi-currency spending summary */}
      <div className="summary-card multi-currency">
        <h3>Total Spent by Currency</h3>
        <div style={{
          display: 'grid',
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}>
          {currencyBudgets.map(({ currency, totalSpent, budgetCount }) => (
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
                  {budgetCount} budgets
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
        <h3>Total Budgets</h3>
        <p>{budgets.length}</p>
      </div>
    </div>
  );
};

export default CurrencyBudgetSummary;
