import React, { useMemo, useEffect, useState } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);

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
  const getBudgetCardStyle = () => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    backgroundColor: isDarkMode ? '#1e3a8a' : '#f0f9ff',
    borderRadius: '0.375rem',
    border: `1px solid ${isDarkMode ? '#3b82f6' : '#bae6fd'}`
  });

  const getSpentCardStyle = () => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    backgroundColor: isDarkMode ? '#7f1d1d' : '#fef2f2',
    borderRadius: '0.375rem',
    border: `1px solid ${isDarkMode ? '#ef4444' : '#fecaca'}`
  });

  const getCurrencyTextStyle = () => ({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: isDarkMode ? '#f8fafc' : '#000000'
  });

  const getBudgetTagStyle = () => ({
    fontSize: '0.75rem',
    color: isDarkMode ? '#93c5fd' : '#0369a1',
    backgroundColor: isDarkMode ? '#1e40af' : '#bae6fd',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem'
  });

  const getSpentTagStyle = () => ({
    fontSize: '0.75rem',
    color: isDarkMode ? '#fca5a5' : '#dc2626',
    backgroundColor: isDarkMode ? '#dc2626' : '#fecaca',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem'
  });

  const getAmountTextStyle = () => ({
    fontWeight: 600,
    color: isDarkMode ? '#f8fafc' : '#000000'
  });
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
            ...getBudgetCardStyle(),
            marginTop: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={getCurrencyTextStyle()}>
                USD
              </span>
              <span style={getBudgetTagStyle()}>
                0 budgets
              </span>
            </div>
            <div style={getAmountTextStyle()}>
              $0.00
            </div>
          </div>
        </div>
        <div className="summary-card">
          <h3>Total Spent by Currency</h3>
          <div style={{
            ...getSpentCardStyle(),
            marginTop: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={getCurrencyTextStyle()}>
                USD
              </span>
              <span style={getSpentTagStyle()}>
                0 budgets
              </span>
            </div>
            <div style={getAmountTextStyle()}>
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
            ...getBudgetCardStyle(),
            marginTop: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={getCurrencyTextStyle()}>
                {budgetData.currency}
              </span>
              <span style={getBudgetTagStyle()}>
                {budgetData.budgetCount} budgets
              </span>
            </div>
            <div style={getAmountTextStyle()}>
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
            ...getSpentCardStyle(),
            marginTop: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={getCurrencyTextStyle()}>
                {budgetData.currency}
              </span>
              <span style={getSpentTagStyle()}>
                {budgetData.budgetCount} budgets
              </span>
            </div>
            <div style={getAmountTextStyle()}>
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
              style={getBudgetCardStyle()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={getCurrencyTextStyle()}>
                  {currency}
                </span>
                <span style={getBudgetTagStyle()}>
                  {budgetCount} budgets
                </span>
              </div>
              <div style={getAmountTextStyle()}>
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
              style={getSpentCardStyle()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={getCurrencyTextStyle()}>
                  {currency}
                </span>
                <span style={getSpentTagStyle()}>
                  {budgetCount} budgets
                </span>
              </div>
              <div style={getAmountTextStyle()}>
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
