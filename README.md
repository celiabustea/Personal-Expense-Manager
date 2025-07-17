# Personal Expense Manager


A comprehensive web-based financial management application built with Next.js and React that helps you track expenses, manage budgets, and analyze your financial patterns.

## 🚀 Features

### 💳 Transaction Management
- **Add/Edit/Delete Transactions**: Easily manage your income and expenses
- **Budget Integration**: Automatically assign transactions to budgets
- **Positive/Negative Amounts**: Use negative amounts for expenses, positive for income
- **Budget Overflow Protection**: Prevents transactions that exceed budget limits
- **Transaction Categories**: Organize transactions by budget categories
- **Recurring Transactions**: Set up automatic recurring payments

### 📊 Budget Management
- **Create Custom Budgets**: Set spending limits for different categories
- **Real-time Tracking**: See how much you've spent vs. your budget
- **Automatic Updates**: Budgets update automatically when transactions are added
- **Visual Indicators**: Clear warnings when approaching budget limits
- **Multiple Categories**: Food, Entertainment, Transportation, and more

### 📈 Reports & Analytics
- **Monthly Overview**: Total spending, income, and net balance
- **Spending by Budget**: Pie chart breakdown of expenses by category
- **Monthly Trends**: Track spending patterns over time
- **Daily Spending Patterns**: Analyze your daily financial habits
- **Income vs Expenses**: Visual comparison of earnings vs spending
- **Transaction Frequency**: See which categories you use most

### 🌙 User Experience
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Interface**: Intuitive and easy-to-use design
- **Real-time Updates**: Changes reflect immediately across the app

### 📤 Data Export
- **CSV Export**: Export all financial data for spreadsheet analysis
- **JSON Export**: Backup your data in JSON format
- **Data Summary**: See transaction and budget counts before export

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **State Management**: Redux Toolkit
- **Styling**: CSS Modules, Styled JSX
- **Charts**: Recharts for data visualization
- **Icons**: Custom icon components
- **Development**: ESLint, TypeScript strict mode

## 📁 Project Structure

```
Personal-Expense-Manager/
├── frontend/
│   ├── pages/                 # Next.js pages
│   │   ├── transactions.tsx   # Transaction management
│   │   ├── budgets.tsx       # Budget management
│   │   ├── reports.tsx       # Analytics dashboard
│   │   └── settings.tsx      # App settings & export
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── store/           # Redux store & slices
│   │   ├── utils/           # Utility functions
│   │   ├── contexts/        # React contexts
│   │   └── styles/          # CSS files
│   └── public/              # Static assets
└── backend/                 # Backend API (future)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Personal-Expense-Manager
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 How to Use

### 1. Adding Transactions
- Click "Add Transaction" button
- Enter description and amount
  - Use negative amounts for expenses (e.g., -50.00)
  - Use positive amounts for income (e.g., +1000.00)
- Select a budget category
- Choose date and set recurring if needed
- Click "Add Transaction"

### 2. Managing Budgets
- Go to "Budgets" page
- Click "Add Budget" to create new budget categories
- Set spending limits for each category
- Monitor your spending progress with visual indicators

### 3. Viewing Reports
- Visit "Reports" page for comprehensive analytics
- Use month selector to view different time periods
- Analyze spending patterns with interactive charts
- Track your financial progress over time

### 4. Exporting Data
- Go to "Settings" page
- Choose between CSV or JSON export formats
- Download your complete financial data for backup or analysis

## 🎯 Key Features Explained

### Budget Integration
When you add a transaction with a selected budget:
- **Spending** (negative amount): Adds to budget's spent amount
- **Income** (positive amount): Subtracts from budget's spent amount
- **Overflow Protection**: Warns if transaction exceeds budget limit

### Smart Categorization
- Transactions automatically inherit the category from selected budget
- Easy filtering and organization by category
- Visual indicators show which budget each transaction affects

### Real-time Analytics
- All charts update automatically when transactions are added
- Monthly summaries calculate totals dynamically
- Visual progress bars show budget utilization

## 🔧 Configuration

### Dark Mode
Toggle dark mode from the settings page or use the theme button in the navigation.

### Export Settings
Export functionality includes:
- All transactions with categories and amounts
- Budget information with current spent amounts
- Summary statistics for quick overview

## 🚧 Future Enhancements

- [ ] Backend API integration
- [ ] User authentication
- [ ] Multi-currency support
- [ ] Advanced filtering options
This project is for educational and personal use.

---

**Made with ❤️ using Next.js and React**
