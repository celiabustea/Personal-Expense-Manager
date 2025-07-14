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
import { useEffect } from 'react';

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
  useEffect(() => {
    // Component mounted
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
    <PageLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <Heading level={1}>Dashboard</Heading>
        </div>
        <div className="dashboard-summary">
          <div className="summary-card">
            <Heading level={3}>Total Balance</Heading>
            <p className="balance-amount">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="summary-card">
            <Heading level={3}>Monthly Spending</Heading>
            <p className="spending-amount">{formatCurrency(monthlySpending)}</p>
          </div>
          <div className="summary-card">
            <Heading level={3}>Active Budgets</Heading>
            <p>{budgets.length}</p>
          </div>
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
              {recentTransactions.map(transaction => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
              {recentTransactions.length === 0 && (
                <p className="empty-state">No recent transactions</p>
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
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                />
              ))}
              {budgets.length === 0 && (
                <p className="empty-state">No budgets created yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
