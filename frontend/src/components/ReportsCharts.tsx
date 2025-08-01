import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';

interface ReportsChartsProps {
  categoryData: any[];
  monthlyTrendData: any[];
  dailySpendingData: any[];
  budgetPerformanceData: any[];
  incomeVsExpenses: any[];
  colors: string[];
  accentColors: string[];
  spendingByBudget: { name: string; value: number; color?: string }[];
}

const ReportsCharts: React.FC<ReportsChartsProps> = ({
  categoryData,
  monthlyTrendData,
  dailySpendingData,
  budgetPerformanceData,
  incomeVsExpenses,
  colors,
  accentColors,
  spendingByBudget
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Debug logging to see what data we're receiving
  useEffect(() => {
    console.log('📊 ReportsCharts Data Debug:', {
      spendingByBudget: { length: spendingByBudget.length, data: spendingByBudget },
      monthlyTrendData: { length: monthlyTrendData.length, data: monthlyTrendData },
      dailySpendingData: { length: dailySpendingData.length, data: dailySpendingData },
      budgetPerformanceData: { length: budgetPerformanceData.length, data: budgetPerformanceData },
      incomeVsExpenses: { length: incomeVsExpenses.length, data: incomeVsExpenses }
    });
  }, [spendingByBudget, monthlyTrendData, dailySpendingData, budgetPerformanceData, incomeVsExpenses]);

  useEffect(() => {
    // Check for dark mode
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

  // Dark mode aware colors
  const getAxisColor = () => isDarkMode ? '#94a3b8' : '#374151';
  const getGridColor = () => isDarkMode ? '#475569' : '#e5e7eb';
  const getLineSpendingColor = () => isDarkMode ? '#fbbf24' : accentColors[0]; // Bright yellow in dark mode
  const getLineIncomeColor = () => isDarkMode ? '#34d399' : accentColors[2]; // Bright green in dark mode
  const getTooltipStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.95)',
    border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb',
    borderRadius: '8px',
    color: isDarkMode ? '#f8fafc' : 'white'
  });
  // Custom tooltip component with dark mode support
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={getTooltipStyle()}>
          <p style={{ fontWeight: 600, marginBottom: '4px', color: isDarkMode ? '#cbd5e1' : '#e2e8f0' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '2px 0', 
              fontSize: '14px',
              color: entry.color 
            }}>
              {entry.name}: {typeof entry.value === 'number' ? `$${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid">
      {/* Spending by Budget/Category for Selected Month - Pie Chart */}
      <div className="chart-card">
        <h3>Spending by Budget (Selected Month)</h3>
        {spendingByBudget.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByBudget}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {spendingByBudget.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: getAxisColor() }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.9rem'
          }}>
            No spending data for selected month
          </div>
        )}
      </div>

      {/* Monthly Spending Trend - Line Chart */}
      <div className="chart-card">
        <h3>Monthly Spending Trend</h3>
        {monthlyTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} />
              <XAxis dataKey="month" tick={{ fill: getAxisColor() }} />
              <YAxis tick={{ fill: getAxisColor() }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: getAxisColor() }} />
              <Line type="monotone" dataKey="spending" stroke={getLineSpendingColor()} strokeWidth={3} />
              <Line type="monotone" dataKey="income" stroke={getLineIncomeColor()} strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.9rem'
          }}>
            No transaction history available
          </div>
        )}
      </div>

      {/* Daily Spending Pattern - Area Chart */}
      <div className="chart-card">
        <h3>Daily Spending Pattern</h3>
        {dailySpendingData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailySpendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} />
              <XAxis dataKey="day" tick={{ fill: getAxisColor() }} />
              <YAxis tick={{ fill: getAxisColor() }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke={accentColors[2]} fill={accentColors[2]} fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.9rem'
          }}>
            No daily spending data for selected month
          </div>
        )}
      </div>

      {/* Budget Performance - Bar Chart */}
      <div className="chart-card">
        <h3>Budget Performance</h3>
        {budgetPerformanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} />
              <XAxis dataKey="category" tick={{ fill: getAxisColor() }} />
              <YAxis tick={{ fill: getAxisColor() }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: getAxisColor() }} />
              <Bar dataKey="budget" fill={accentColors[4]} />
              <Bar dataKey="spent" fill={accentColors[1]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.9rem'
          }}>
            No budgets available
          </div>
        )}
      </div>

      {/* Income vs Expenses - Composed Chart */}
      <div className="chart-card">
        <h3>Income vs Expenses</h3>
        {incomeVsExpenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} />
              <XAxis dataKey="name" tick={{ fill: getAxisColor() }} />
              <YAxis tick={{ fill: getAxisColor() }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: getAxisColor() }} />
              <Bar dataKey="value">
                {incomeVsExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || accentColors[index % accentColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.9rem'
          }}>
            No income/expense data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsCharts;
