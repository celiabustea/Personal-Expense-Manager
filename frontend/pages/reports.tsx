import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { selectTotalBalance } from '../src/store';
import dynamic from 'next/dynamic';
import { ReportsProvider, useReports } from '../src/contexts/ReportsContext';
import ReportsHeader from '../src/components/molecules/ReportsHeader/ReportsHeader';
import MultiCurrencyTotals from '../src/components/molecules/MultiCurrencyTotals/MultiCurrencyTotals';

// Dynamic imports for components
const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '1.1rem',
  }} className="loading-text">Loading Reports...</div>
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
  }} className="loading-text">Loading Charts...</div>,
  ssr: false
});

const Reports = () => {
  const transactions = useSelector((state: RootState) => state.transactions.items);
  const budgets = useSelector((state: RootState) => state.budgets.items);
  const totalBalance = useSelector(selectTotalBalance);

  const isEmpty = transactions.length === 0;
  

  // Month filter state
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  return (
    <ReportsProvider>
      <ReportsContent 
        transactions={transactions}
        budgets={budgets}
        totalBalance={totalBalance}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        isEmpty={isEmpty}
      />
    </ReportsProvider>
  );
};

interface ReportsContentProps {
  transactions: any[];
  budgets: any[];
  totalBalance: number;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isEmpty: boolean;
}

const ReportsContent: React.FC<ReportsContentProps> = ({
  transactions,
  budgets,
  totalBalance,
  selectedMonth,
  setSelectedMonth,
  isEmpty
}) => {
  const { viewMode } = useReports();

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
          const budget = budgetsById[String(t.budgetId)];
          label = budget.name || budget.category || 'Budget';
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

    // Monthly trend data: spending over the last 6 months
    const monthlyTrendData: any[] = [];
    const last6Months = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    last6Months.forEach(month => {
      const monthTransactions = transactions.filter(t => (t.timestamp || t.date).slice(0, 7) === month);
      const spending = monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const income = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      
      monthlyTrendData.push({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        spending,
        income
      });
    });

    // Daily spending pattern for current month
    const dailySpendingData: any[] = [];
    const currentMonthTransactions = transactions.filter(t => (t.timestamp || t.date).slice(0, 7) === selectedMonth);
    const dailySpending: Record<string, number> = {};
    
    currentMonthTransactions.forEach(t => {
      if (t.amount < 0) {
        const day = new Date(t.timestamp || t.date).getDate();
        const dayKey = `Day ${day}`;
        dailySpending[dayKey] = (dailySpending[dayKey] || 0) + Math.abs(t.amount);
      }
    });

    Object.entries(dailySpending).forEach(([day, amount]) => {
      dailySpendingData.push({ day, amount });
    });

    // Budget performance data
    const budgetPerformanceData: any[] = budgets.map(budget => ({
      category: budget.category,
      budget: budget.amount,
      spent: budget.spent || 0,
    }));

    // Income vs Expenses for current month
    const incomeVsExpenses: any[] = [
      { name: 'Income', value: totalIncome, color: '#10b981' },
      { name: 'Expenses', value: totalSpending, color: '#ef4444' }
    ];

    // Transaction frequency by category
    const transactionFrequency: any[] = [];
    const frequencyMap: Record<string, number> = {};
    
    transactions.forEach(t => {
      const category = t.category || 'Other';
      frequencyMap[category] = (frequencyMap[category] || 0) + 1;
    });

    Object.entries(frequencyMap).forEach(([category, count]) => {
      transactionFrequency.push({ category, count });
    });
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
      netIncome: totalBalance + totalIncome, // Total Balance (remaining budget) + Total Income
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

        {/* Multi-Currency Reports Header */}
        <ReportsHeader />

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
            <h2 style={{fontWeight: 600, marginBottom: '0.5rem'}} className="empty-state-title">No Data Yet</h2>
            <p style={{maxWidth: 340, fontSize: '1.08rem'}} className="empty-state-text">Add transactions and budgets to see your financial reports and trends visualized here.</p>
          </div>
        ) : (
          <>
            {/* Native View: Move month selector above multi-currency totals */}
            {viewMode === 'native' && (
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
              </div>
            )}

            {/* Multi-Currency Totals */}
            <MultiCurrencyTotals transactions={transactions} budgets={budgets} />

            {/* Unified View: Month selector only (totals handled by MultiCurrencyTotals) */}
            {viewMode === 'unified' && (
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
                  <div className="total-spent-month">
                    Total Spent for Month: <span className="total-spent-amount">${totalSpentForMonth.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            <ReportsCharts 
              categoryData={categoryData}
              monthlyTrendData={monthlyTrendData}
              dailySpendingData={dailySpendingData}
              budgetPerformanceData={budgetPerformanceData}
              incomeVsExpenses={incomeVsExpenses}
              colors={colors}
              accentColors={accentColors}
              spendingByBudget={spendingByBudget}
            />
          </>
        )}
      </div>
      
      <style jsx>{`
        /* Ensure all components have hover float effects */
        .reports-container > * {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .reports-container > *:hover {
          transform: translateY(-4px);
        }
        
        /* Enhanced hover effects for specific sections */
        .reports-container div[style*="display:flex"]:hover {
          transform: translateY(-3px);
        }
        
        .reports-container div[style*="background"]:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Empty state hover enhancement */
        .reports-container div[style*="minHeight: '340px'"]:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Month selector container hover */
        .reports-container div[style*="gap:'1.5rem'"]:hover {
          transform: translateY(-3px);
        }
        
        /* Loading text hover */
        .reports-container .loading-text:hover {
          transform: translateY(-2px);
        }
        
        /* Dark mode hover effects */
        :global(.dark-mode) .reports-container div[style*="background"]:hover {
          box-shadow: 0 8px 20px rgba(71, 85, 105, 0.2);
        }
        
        :global(.dark-mode) .reports-container div[style*="minHeight: '340px'"]:hover {
          box-shadow: 0 10px 25px rgba(71, 85, 105, 0.2);
        }
      `}</style>
    </PageLayout>
  );
};

export default Reports;
