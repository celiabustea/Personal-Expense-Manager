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

  const isEmpty = transactions.length === 0 && budgets.length === 0;
  

  // Month filter state
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

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


    // Calculate total spent for selected month
    const totalSpentForMonth = transactions
      .filter(t => t.amount < 0 && (t.timestamp || t.date).slice(0, 7) === selectedMonth)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Pie chart data: spending by budget/category for selected month
    const budgetsById: Record<string | number, typeof budgets[0]> = Object.fromEntries(budgets.map(b => [b.id, b]));
    const spendingByBudget: { name: string; value: number; color?: string }[] = [];
    transactions.forEach(t => {
      if (t.amount < 0 && (t.timestamp || t.date).slice(0, 7) === selectedMonth) {
        // Try to match by budgetId, fallback to category
        let label = '';
        if ('budgetId' in t && t.budgetId !== undefined && t.budgetId !== null && budgetsById[String(t.budgetId)]) {
          label = budgetsById[String(t.budgetId)].name;
        } else if (t.category) {
          label = t.category;
        } else {
          label = 'Other';
        }
        const existing = spendingByBudget.find(b => b.name === label);
        if (existing) {
          existing.value += Math.abs(t.amount);
        } else {
          spendingByBudget.push({ name: label, value: Math.abs(t.amount) });
        }
      }
    });

    // Remove all hardcoded data arrays. Use empty arrays or real data only.
    const monthlyTrendData: any[] = [];
    const dailySpendingData: any[] = [];
    const budgetPerformanceData: any[] = budgets.map(budget => ({
      category: budget.category,
      budget: budget.amount,
      spent: budget.spent || 0,
    }));
    const incomeVsExpenses: any[] = [];
    const transactionFrequency: any[] = [];
    const colors: string[] = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const accentColors: string[] = ['#1e293b', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

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
      netIncome: totalIncome - totalSpending,
      totalSpentForMonth,
      spendingByBudget
    };
  }, [transactions, budgets, selectedMonth]);

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
    netIncome,
    totalSpentForMonth,
    spendingByBudget
  } = reportData;

  return (
    <PageLayout>
      <div className="reports-container">
        <div className="reports-header">
          <Heading level={1}>Reports</Heading>
          <p>Visualize your financial data and trends</p>
        </div>
        {isEmpty ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '340px',
            padding: '2.5rem 0',
            color: '#64748b',
            textAlign: 'center',
          }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: '1.2rem'}}>
              <circle cx="40" cy="40" r="38" stroke="#e2e8f0" strokeWidth="4" fill="#f8fafc" />
              <rect x="22" y="32" width="36" height="20" rx="6" fill="#e2e8f0" />
              <rect x="30" y="40" width="20" height="4" rx="2" fill="#cbd5e1" />
              <rect x="34" y="46" width="12" height="2" rx="1" fill="#cbd5e1" />
              <circle cx="40" cy="38" r="3" fill="#94a3b8" />
            </svg>
            <h2 style={{fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem'}}>No Data Yet</h2>
            <p style={{maxWidth: 340, color: '#64748b', fontSize: '1.08rem'}}>Add transactions and budgets to see your financial reports and trends visualized here.</p>
          </div>
        ) : (
          <>
            {/* Month Selector and Total Spent for Month */}
            <div style={{display:'flex',alignItems:'center',gap:'1.5rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
              <div>
                <label style={{fontWeight:500,marginRight:8}}>Select Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  style={{padding:'0.4rem 0.7rem',border:'1px solid #d1d5db',borderRadius:6,fontSize:'1rem'}}
                />
              </div>
              <div style={{fontWeight:500,fontSize:'1.08rem',color:'#1e293b'}}>
                Total Spent for Month: <span style={{fontWeight:700}}>${totalSpentForMonth.toFixed(2)}</span>
              </div>
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
              spendingByBudget={spendingByBudget}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Reports;
