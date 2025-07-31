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
  
  useEffect(() => {
    // Set hydrated to true after component mounts on client
    setIsHydrated(true);
  }, []);
  
  // Use memoized selectors for better performance
  const recentTransactions = useSelector(selectRecentTransactions).slice(0, 3);
  const totalBalance = useSelector(selectTotalBalance);
  const monthlySpending = useSelector(selectMonthlySpending);
  const budgets = useSelector(selectBudgetsWithCalculatedSpent);
  const allTransactions = useSelector(selectAllTransactions);

  // Calculate currency-specific data
  const currencyData = useMemo(() => {
    const budgetsByCurrency: { [key: string]: { totalBudgeted: number; count: number } } = {};
    const spendingByCurrency: { [key: string]: number } = {};

    // Group budgets by currency
    budgets.forEach(budget => {
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
  }, [budgets, allTransactions]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: currency
    });
  };

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
            ) : (
              currencyData.map(data => (
                <div key={data.currency} style={{
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
                      {data.currency}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#0369a1',
                      backgroundColor: '#bae6fd',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem'
                    }}>
                      {data.budgetCount} budgets
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#000000' }}>
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
            ) : (
              currencyData.map(data => (
                <div key={data.currency} style={{
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
                      {data.currency}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      backgroundColor: '#fecaca',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem'
                    }}>
                      {data.budgetCount} budgets
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#000000' }}>
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
            <p>{isHydrated ? budgets.length : 0}</p>
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
