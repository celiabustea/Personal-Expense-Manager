import React from 'react';
import { useSelector } from 'react-redux';
import { 
  selectRecentTransactions, 
  selectTotalBalance, 
  selectMonthlySpending, 
  selectBudgets 
} from '../src/store';
import dynamic from 'next/dynamic';
import Link from "next/link";
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MantraCard from '../src/components/molecules/MantraCard/MantraCard';

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
  const budgets = useSelector(selectBudgets);

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
          <div className="summary-card">
            <Heading level={3}>Total Balance</Heading>
            <p className="balance-amount">
              {isHydrated ? formatCurrency(totalBalance) : formatCurrency(0)}
            </p>
            <span className="balance-subtitle">Budget remaining</span>
          </div>
          <div className="summary-card">
            <Heading level={3}>Monthly Spending</Heading>
            <p className="spending-amount">
              {isHydrated ? formatCurrency(monthlySpending) : formatCurrency(0)}
            </p>
            <span className="spending-subtitle">This month</span>
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
