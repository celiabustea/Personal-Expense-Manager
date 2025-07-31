# Personal Expense Manager


A compre### 🌍 Multi-Currency Features
- **6 Supported Currencies**: USD, EUR, GBP, JPY, CAD, RON (+ 160+ via exchangerate-api.com)
- **Real-Time Exchange Rates**: Integration with exchangerate-api.com (with mock fallback)
- **Smart Caching**: 1-hour server cache and 5-minute client cache for performance
- **Currency Conversion Dialogs**: Clear income/expense-specific confirmation flows
- **Mixed-Currency Transactions**: Enter in one currency, automatically convert to budget currency
- **Historical Rate Tracking**: Store exchange rates for each transaction
- **Base Currency Reports**: Convert all totals to selected currency for unified analysis
- **Native Currency View**: Toggle to see original amounts without conversion
- **Currency Tags & Visual Indicators**: Small badges and tooltips showing currency information
- **Advanced Multi-Currency Reporting**: Sophisticated reporting with unified vs native view modes

### 📊 Advanced Multi-Currency Reporting

#### **Unified vs Native View Modes** 🔄
- **Unified View**: Converts all amounts to your selected base currency for easy comparison
- **Native View**: Shows each transaction/budget in its original currency with per-currency totals
- **Smart Toggle**: One-click switching between view modes with clear explanations
- **Base Currency Selection**: Choose from USD, EUR, GBP, JPY, CAD, RON for unified reporting

#### **Currency Tags & Visual System** 🏷️
- **Color-Coded Currency Tags**: Small badges on every amount showing currency (USD, EUR, etc.)
- **Conversion Tooltips**: Hover over converted amounts to see original values
- **Mixed-Currency Indicators**: Visual warnings when viewing data with multiple currencies
- **Consistent Presentation**: CurrencyDisplay component ensures uniform currency formatting

#### **Multi-Currency Workflow Examples** 💼

**Setting Up Multi-Currency Budgets:**
```
🍽️ Food Budget: $500.00 USD
🏠 Rent Budget: €1,200.00 EUR  
🚗 Transport Budget: £150.00 GBP
💰 Entertainment Budget: ¥30,000 JPY
```

**Cross-Currency Transaction Flow:**
```
1. Enter transaction: €100.00 (selected EUR from dropdown)
2. Auto-conversion prompt: "Convert €100.00 to $108.50?"
3. Live exchange rate shown: "1 EUR = 1.085 USD"
4. Confirmation with visual context (green for income, red for expense)
5. Stored with both original and converted amounts
```

**Advanced Reporting Views:**
```
📊 Unified View (Base: USD)
├── Total Spending: $2,547.85 USD (converted from mixed currencies)
├── Total Income: $5,420.00 USD (converted from mixed currencies)
└── Net Income: $2,872.15 USD (converted)

📊 Native View (Original Currencies)
├── USD: $1,200.00 spending, $3,500.00 income
├── EUR: €450.00 spending, €1,200.00 income  
├── GBP: £125.00 spending, £300.00 income
└── 💡 Tip: Switch to Unified View for single-currency comparison
```eb-based financial management application built with Next.js and React that helps you track expenses, manage budgets, and analyze your financial patterns.

## 🚀 Features

### 💳 Transaction Management
- **Add/Edit/Delete Transactions**: Easily manage your income and expenses
- **Multi-Currency Support**: Enter transactions in different currencies with automatic conversion
- **Budget Integration**: Automatically assign transactions to budgets
- **Positive/Negative Amounts**: Use negative amounts for expenses, positive for income
- **Budget Overflow Protection**: Prevents transactions that exceed budget limits
- **Transaction Categories**: Organize transactions by budget categories
- **Recurring Transactions**: Set up automatic recurring payments
- **Real-Time Exchange Rates**: Live currency conversion with fallback to mock rates

### 📊 Budget Management
- **Create Custom Budgets**: Set spending limits for different categories
- **Multi-Currency Budgets**: Each budget can have its own currency
- **Real-time Tracking**: See how much you've spent vs. your budget
- **Automatic Currency Conversion**: Cross-currency transactions convert automatically
- **Automatic Updates**: Budgets update automatically when transactions are added
- **Visual Indicators**: Clear warnings when approaching budget limits
- **Multiple Categories**: Food, Entertainment, Transportation, and more
- **Currency Exchange Confirmation**: Transparent conversion dialogs for all cross-currency transactions

### 📈 Reports & Analytics
- **Base Currency Selection**: Choose display currency for unified reporting (USD, EUR, GBP, JPY, CAD, RON)
- **Unified vs Native View Toggle**: Switch between converted totals and original currencies
- **Monthly Overview**: Total spending, income, and net balance in selected currency
- **Multi-Currency Awareness**: Currency tags on all values with conversion tooltips
- **Spending by Budget**: Pie chart breakdown of expenses by category (unified mode)
- **Per-Currency Totals**: Separate totals for each currency in native mode
- **Monthly Trends**: Track spending patterns over time with currency conversion
- **Daily Spending Patterns**: Analyze your daily financial habits
- **Income vs Expenses**: Visual comparison of earnings vs spending
- **Transaction Frequency**: See which categories you use most
- **Exchange Rate History**: Track conversion rates and timestamps

### � Multi-Currency Features
- **6 Supported Currencies**: USD, EUR, GBP, JPY, CAD, RON
- **Real-Time Exchange Rates**: Integration with exchangerate-api.com (with mock fallback)
- **Smart Caching**: 1-hour server cache and 5-minute client cache for performance
- **Currency Conversion Dialogs**: Clear income/expense-specific confirmation flows
- **Mixed-Currency Transactions**: Enter in one currency, automatically convert to budget currency
- **Historical Rate Tracking**: Store exchange rates for each transaction
- **Base Currency Reports**: Convert all totals to selected currency for unified analysis
- **Native Currency View**: Toggle to see original amounts without conversion
### 🌙 User Experience
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Interface**: Intuitive and easy-to-use design
- **Real-time Updates**: Changes reflect immediately across the app
- **Currency Indicators**: Clear currency symbols and tags throughout the interface
- **Smart Tooltips**: Hover to see original amounts and conversion details

### 📤 Data Export
- **CSV Export**: Export all financial data for spreadsheet analysis
- **JSON Export**: Backup your data in JSON format
- **Data Summary**: See transaction and budget counts before export

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Backend**: Node.js, Express, TypeORM
- **Database**: PostgreSQL (Supabase)
- **State Management**: Redux Toolkit
- **Currency API**: exchangerate-api.com with intelligent fallbacks
- **Styling**: CSS Modules, Styled JSX
- **Charts**: Recharts for data visualization
- **Authentication**: Supabase Auth
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

### 5. Multi-Currency Workflow
- **Adding Cross-Currency Transactions**: Enter amount in any currency, system auto-converts to budget currency
- **Conversion Confirmation**: Review exchange rates before confirming transactions
- **Reports View Toggle**: Switch between "Unified View" (all converted) and "Native View" (original currencies)
- **Base Currency Selection**: Choose display currency for unified reports and totals
- **Currency Tags**: See original and converted amounts with clear currency indicators

## 🌍 Multi-Currency Example Workflow

### Setup
Create budgets in different currencies:
- Transportation: $400 (USD)
- Salary: RON 2,300 (Romanian Leu)  
- Entertainment: €1,000 (Euro)

### Adding Transactions
1. **Gas Purchase**: Enter -50 EUR for Transportation budget (USD)
   - System shows: "-50.00 EUR → -54.50 USD" 
   - Confirm conversion → stored as -54.50 USD with original -50 EUR tracked

2. **Salary Income**: Enter +2000 RON for Salary budget
   - System shows: "+2000.00 RON → +2000.00 RON" (same currency, no conversion)

### Viewing Reports
**Unified View (Base Currency: USD)**
- All totals converted to USD for comparison
- Pie charts show proportional spending in USD
- Clear conversion tooltips on hover

**Native View**
- Each transaction/budget shown in original currency
- Per-currency totals: "USD: $345.50 | EUR: €950 | RON: 300"
- Mixed-currency charts disabled or shown separately

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
