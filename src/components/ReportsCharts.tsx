import React from 'react';
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
  transactionFrequency: any[];
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
  transactionFrequency,
  colors,
  accentColors,
  spendingByBudget
}) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
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
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Spending Trend - Line Chart */}
      <div className="chart-card">
        <h3>Monthly Spending Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="spending" stroke={accentColors[0]} strokeWidth={3} />
            <Line type="monotone" dataKey="budget" stroke={accentColors[3]} strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Spending Pattern - Area Chart */}
      <div className="chart-card">
        <h3>Daily Spending Pattern</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailySpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="amount" stroke={accentColors[2]} fill={accentColors[2]} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Performance - Bar Chart */}
      <div className="chart-card">
        <h3>Budget Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="budget" fill={accentColors[4]} />
            <Bar dataKey="spent" fill={accentColors[1]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Income vs Expenses - Composed Chart */}
      <div className="chart-card">
        <h3>Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={incomeVsExpenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" fill={accentColors[2]} />
            <Bar dataKey="expenses" fill={accentColors[1]} />
            <Line type="monotone" dataKey="savings" stroke={accentColors[5]} strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Frequency - Radial Bar Chart */}
      <div className="chart-card">
        <h3>Transaction Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={transactionFrequency}>
            <RadialBar dataKey="count" cornerRadius={10} fill={accentColors[6]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportsCharts;
