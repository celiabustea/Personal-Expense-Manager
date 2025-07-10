import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import dynamic from 'next/dynamic';

// Dynamic imports for components
const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '1.1rem',
    color: '#1e293b'
  }}>Loading Reports...</div>
});

const Heading = dynamic(() => import('../src/components/atoms/Headings/Heading'));

// Dynamic import for charts to reduce bundle size
const ReportsCharts = dynamic(() => import('../src/components/ReportsCharts'), {
  loading: () => <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    fontSize: '1rem',
    color: '#64748b'
  }}>Loading Charts...</div>,
  ssr: false
});

const Reports = () => {
  const transactions = useSelector((state: RootState) => state.transactions.items);
  const budgets = useSelector((state: RootState) => state.budgets.items);
  
  // Memoize expensive calculations
  const reportData = useMemo(() => {
    const totalSpending = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyAverage = totalSpending / 12;
    
    const categoryData = transactions
      .filter(t => t.amount < 0)
      .reduce((acc: any[], transaction) => {
        const existing = acc.find(item => item.name === transaction.category);
        if (existing) {
          existing.value += Math.abs(transaction.amount);
        } else {
          acc.push({
            name: transaction.category,
            value: Math.abs(transaction.amount)
          });
        }
        return acc;
      }, []);

    // Monthly spending trend data
    const monthlyTrendData = [
      { month: 'Jan', spending: 1200, budget: 1500 },
      { month: 'Feb', spending: 1100, budget: 1500 },
      { month: 'Mar', spending: 1300, budget: 1500 },
      { month: 'Apr', spending: 1400, budget: 1500 },
      { month: 'May', spending: 1250, budget: 1500 },
      { month: 'Jun', spending: 1350, budget: 1500 },
    ];

    // Daily spending pattern
    const dailySpendingData = [
      { day: 'Mon', amount: 45 },
      { day: 'Tue', amount: 32 },
      { day: 'Wed', amount: 68 },
      { day: 'Thu', amount: 28 },
      { day: 'Fri', amount: 85 },
      { day: 'Sat', amount: 120 },
      { day: 'Sun', amount: 95 },
    ];

    // Budget performance data
    const budgetPerformanceData = budgets.map(budget => ({
      category: budget.category,
      budget: budget.amount,
      spent: budget.spent || 0,
    }));

    // Income vs Expenses data
    const incomeVsExpenses = [
      { month: 'Jan', income: 3000, expenses: 1200, savings: 1800 },
      { month: 'Feb', income: 3200, expenses: 1100, savings: 2100 },
      { month: 'Mar', income: 3100, expenses: 1300, savings: 1800 },
      { month: 'Apr', income: 3300, expenses: 1400, savings: 1900 },
      { month: 'May', income: 3400, expenses: 1250, savings: 2150 },
      { month: 'Jun', income: 3500, expenses: 1350, savings: 2150 },
    ];

    // Transaction frequency data
    const transactionFrequency = [
      { category: 'Food', count: 45 },
      { category: 'Transport', count: 32 },
      { category: 'Entertainment', count: 28 },
      { category: 'Shopping', count: 35 },
      { category: 'Health', count: 15 },
    ];

    // Color schemes
    const colors = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const accentColors = ['#1e293b', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

    return { 
      totalSpending, 
      totalIncome, 
      monthlyAverage, 
      categoryData, 
      monthlyTrendData,
      dailySpendingData,
      budgetPerformanceData,
      incomeVsExpenses,
      transactionFrequency,
      colors,
      accentColors,
      netIncome: totalIncome - totalSpending
    };
  }, [transactions, budgets]);

  const { 
    totalSpending, 
    totalIncome, 
    monthlyAverage, 
    categoryData, 
    monthlyTrendData,
    dailySpendingData,
    budgetPerformanceData,
    incomeVsExpenses,
    transactionFrequency,
    colors,
    accentColors,
    netIncome 
  } = reportData;

  return (
    <PageLayout>
      <div className="reports-container">
        <div className="reports-header">
          <Heading level={1}>Reports</Heading>
          <p>Visualize your financial data and trends</p>
        </div>
        <div className="reports-summary">
          <div className="summary-card">
            <Heading level={3}>Total Spending</Heading>
            <p className="amount negative">${totalSpending.toFixed(2)}</p>
            <span className="change">This month</span>
          </div>
          <div className="summary-card">
            <Heading level={3}>Total Income</Heading>
            <p className="amount positive">${totalIncome.toFixed(2)}</p>
            <span className="change">This month</span>
          </div>
          <div className="summary-card">
            <Heading level={3}>Net Income</Heading>
            <p className={`amount ${netIncome >= 0 ? 'positive' : 'negative'}`}>
              ${netIncome.toFixed(2)}
            </p>
            <span className="change">This month</span>
          </div>
          <div className="summary-card">
            <Heading level={3}>Monthly Average</Heading>
            <p className="amount">${monthlyAverage.toFixed(2)}</p>
            <span className="change">Spending</span>
          </div>
        </div>
        <ReportsCharts 
          categoryData={categoryData}
          monthlyTrendData={monthlyTrendData}
          dailySpendingData={dailySpendingData}
          budgetPerformanceData={budgetPerformanceData}
          incomeVsExpenses={incomeVsExpenses}
          transactionFrequency={transactionFrequency}
          colors={colors}
          accentColors={accentColors}
        />
      </div>
    </PageLayout>
  );
};

export default Reports;
