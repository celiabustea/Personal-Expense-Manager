import React from 'react';
import { useSelector } from 'react-redux';
import { 
  selectRecentTransactions, 
  selectTotalBalance, 
  selectMonthlySpending, 
  selectBudgetsWithCalculatedSpent,
  selectAllTransactions
} from '../src/store';
import dynamic from 'next/dynamic';
import Link from "next/link";
import { useEffect, useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MantraCard from '../src/components/molecules/MantraCard/MantraCard';
import CurrencyDisplay from '../src/components/atoms/CurrencyDisplay/CurrencyDisplay';

// Dynamic imports for components
const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '1.1rem',
    color: '#1e293b'
  }}>Loading Dashboard...</div>
});

const Heading = dynamic(() => import('../src/components/atoms/Headings/Heading'));
const Button = dynamic(() => import('../src/components/atoms/Button/Button'));
const Icon = dynamic(() => import('../src/components/atoms/Icons/Icon'));
const TransactionCard = dynamic(() => import('../src/components/molecules/TransactionCard/TransactionCard'));
const BudgetCard = dynamic(() => import('../src/components/molecules/BudgetCard/BudgetCard'));

const Dashboard = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Set hydrated to true after component mounts on client
    setIsHydrated(true);
    
    // Dark mode detection
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
  
  // Use memoized selectors for better performance
  const recentTransactions = useSelector(selectRecentTransactions).slice(0, 3);
  const totalBalance = useSelector(selectTotalBalance);
  const monthlySpending = useSelector(selectMonthlySpending);
  const allBudgets = useSelector(selectBudgetsWithCalculatedSpent);
  const budgets = allBudgets.slice(0, 3); // Show only last 3 budgets
  const allTransactions = useSelector(selectAllTransactions);

  // Calculate currency-specific data
  const currencyData = useMemo(() => {
    const budgetsByCurrency: { [key: string]: { totalBudgeted: number; count: number } } = {};
    const spendingByCurrency: { [key: string]: number } = {};

    // Group budgets by currency
    allBudgets.forEach(budget => {
      const currency = budget.currency || 'USD';
      if (!budgetsByCurrency[currency]) {
        budgetsByCurrency[currency] = { totalBudgeted: 0, count: 0 };
      }
      budgetsByCurrency[currency].totalBudgeted += budget.amount;
      budgetsByCurrency[currency].count += 1;
    });

    // Calculate spending by currency from transactions (only negative amounts)
    allTransactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const currency = transaction.currency || 'USD';
        if (!spendingByCurrency[currency]) {
          spendingByCurrency[currency] = 0;
        }
        spendingByCurrency[currency] += Math.abs(transaction.amount);
      }
    });

    // Combine currencies from both budgets and transactions
    const allCurrencies = new Set([
      ...Object.keys(budgetsByCurrency),
      ...Object.keys(spendingByCurrency)
    ]);

    return Array.from(allCurrencies).map(currency => ({
      currency,
      totalBudgeted: budgetsByCurrency[currency]?.totalBudgeted || 0,
      totalSpending: spendingByCurrency[currency] || 0,
      totalBalance: (budgetsByCurrency[currency]?.totalBudgeted || 0) - (spendingByCurrency[currency] || 0),
      budgetCount: budgetsByCurrency[currency]?.count || 0
    })).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [allBudgets, allTransactions]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: currency
    });
  };

  // Dark mode aware styles for currency cards
  const getBalanceCardStyle = () => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    backgroundColor: isDarkMode ? '#1e3a8a' : '#f0f9ff',
    borderRadius: '0.375rem',
    border: `1px solid ${isDarkMode ? '#3b82f6' : '#bae6fd'}`,
    marginTop: '0.5rem'
  });

  const getSpendingCardStyle = () => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    backgroundColor: isDarkMode ? '#7f1d1d' : '#fef2f2',
    borderRadius: '0.375rem',
    border: `1px solid ${isDarkMode ? '#ef4444' : '#fecaca'}`,
    marginTop: '0.5rem'
  });

  const getCurrencyTextStyle = () => ({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: isDarkMode ? '#f8fafc' : '#000000'
  });

  const getBalanceTagStyle = () => ({
    fontSize: '0.75rem',
    color: isDarkMode ? '#93c5fd' : '#0369a1',
    backgroundColor: isDarkMode ? '#1e40af' : '#bae6fd',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem'
  });

  const getSpendingTagStyle = () => ({
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

  const handleDeleteTransaction = (id: string) => {
    // Handle transaction deletion
  };

  const handleDeleteRecurring = (id: string) => {
    // Handle recurring transaction deletion
  };

  return (
    <ProtectedRoute>
    <PageLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <Heading level={1}>Dashboard</Heading>
        </div>
        <div className="dashboard-summary">
          {/* Total Balance by Currency */}
          <div className="summary-card">
            <Heading level={3}>Total Balance by Currency</Heading>
            <span className="balance-subtitle">Budget remaining</span>
            {currencyData.length === 0 ? (
              <div style={getBalanceCardStyle()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={getCurrencyTextStyle()}>
                    USD
                  </span>
                  <span style={getBalanceTagStyle()}>
                    0 budgets
                  </span>
                </div>
                <div style={getAmountTextStyle()}>
                  $0.00
                </div>
              </div>
            ) : (
              currencyData.map(data => (
                <div key={data.currency} style={getBalanceCardStyle()}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={getCurrencyTextStyle()}>
                      {data.currency}
                    </span>
                    <span style={getBalanceTagStyle()}>
                      {data.budgetCount} budgets
                    </span>
                  </div>
                  <div style={getAmountTextStyle()}>
                    <CurrencyDisplay 
                      amount={data.totalBalance} 
                      currency={data.currency}
                      showCurrencyTag={false}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Monthly Spending by Currency */}
          <div className="summary-card">
            <Heading level={3}>Monthly Spending by Currency</Heading>
            <span className="spending-subtitle">This month</span>
            {currencyData.length === 0 ? (
              <div style={getSpendingCardStyle()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={getCurrencyTextStyle()}>
                    USD
                  </span>
                  <span style={getSpendingTagStyle()}>
                    0 budgets
                  </span>
                </div>
                <div style={getAmountTextStyle()}>
                  $0.00
                </div>
              </div>
            ) : (
              currencyData.map(data => (
                <div key={data.currency} style={getSpendingCardStyle()}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={getCurrencyTextStyle()}>
                      {data.currency}
                    </span>
                    <span style={getSpendingTagStyle()}>
                      {data.budgetCount} budgets
                    </span>
                  </div>
                  <div style={getAmountTextStyle()}>
                    <CurrencyDisplay 
                      amount={data.totalSpending} 
                      currency={data.currency}
                      showCurrencyTag={false}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="summary-card">
            <Heading level={3}>Active Budgets</Heading>
            <p>{isHydrated ? allBudgets.length : 0}</p>
            <span className="budgets-subtitle">Categories</span>
          </div>
        </div>

        {/* Daily Mantra Section */}
        <div className="dashboard-mantra">
          <MantraCard />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card recent-transactions">
            <div className="card-header">
              <Heading level={2}>Recent Transactions</Heading>
              <Link href="/transactions">
                <Button 
                  variant="ghost" 
                  label="View All" 
                  onClick={() => {}} 
                  className="view-all-button"
                  icon={<Icon name="chart" size="1rem" />}
                />
              </Link>
            </div>
            <div className="transactions-list">
              {isHydrated ? recentTransactions.map(transaction => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              )) : null}
              {isHydrated && recentTransactions.length === 0 && (
                <p className="empty-state">No recent transactions</p>
              )}
              {!isHydrated && (
                <p className="empty-state">Loading transactions...</p>
              )}
            </div>
          </div>

          <div className="dashboard-card budget-overview">
            <div className="card-header">
              <Heading level={2}>Budget Overview</Heading>
              <Link href="/budgets">
                <Button 
                  variant="ghost" 
                  label="View All" 
                  onClick={() => {}} 
                  className="view-all-button"
                  icon={<Icon name="budget" size="1rem" />}
                />
              </Link>
            </div>
            <div className="budget-list">
              {isHydrated ? budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                />
              )) : null}
              {isHydrated && budgets.length === 0 && (
                <p className="empty-state">No budgets created yet</p>
              )}
              {!isHydrated && (
                <p className="empty-state">Loading budgets...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
