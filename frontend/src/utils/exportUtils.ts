// Utility functions for exporting financial data

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  timestamp?: string;
  currency?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
}

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  limit: number;
  currency: string;
  spent: number;
}

interface ExportData {
  transactions: Transaction[];
  budgets: Budget[];
  exportDate: string;
  totalTransactions: number;
  totalBudgets: number;
}

/**
 * Downloads a file with the given content and filename
 */
const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Converts array of objects to CSV format
 */
const arrayToCSV = (data: any[], headers: string[]): string => {
  const csvContent = [
    headers.join(','),
    ...data.map(item => 
      headers.map(header => {
        let value = item[header];
        // Handle special cases
        if (value === null || value === undefined) value = '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

/**
 * Exports data as CSV format
 */
export const exportToCSV = (transactions: Transaction[], budgets: Budget[]) => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    let csvContent = '';

    // Add metadata
    csvContent += `Financial Data Export\n`;
    csvContent += `Export Date,${new Date().toLocaleDateString()}\n`;
    csvContent += `Total Transactions,${transactions.length}\n`;
    csvContent += `Total Budgets,${budgets.length}\n\n`;

    // Export transactions
    if (transactions.length > 0) {
      csvContent += `TRANSACTIONS\n`;
      const transactionHeaders = ['id', 'date', 'description', 'category', 'amount', 'currency', 'isRecurring', 'recurringFrequency'];
      csvContent += arrayToCSV(transactions, transactionHeaders);
      csvContent += '\n\n';
    }

    // Export budgets
    if (budgets.length > 0) {
      csvContent += `BUDGETS\n`;
      const budgetHeaders = ['id', 'name', 'category', 'amount', 'limit', 'spent', 'currency'];
      csvContent += arrayToCSV(budgets, budgetHeaders);
    }

    downloadFile(csvContent, `financial-data-${timestamp}.csv`, 'text/csv');
    return { success: true, message: 'Data exported to CSV successfully!' };
  } catch (error) {
    console.error('CSV Export Error:', error);
    return { success: false, message: 'Failed to export CSV data' };
  }
};

/**
 * Exports data as JSON format
 */
export const exportToJSON = (transactions: Transaction[], budgets: Budget[]) => {
  try {
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      totalTransactions: transactions.length,
      totalBudgets: budgets.length,
      transactions: transactions.map(t => ({
        ...t,
        // Ensure consistent date format
        date: t.date || t.timestamp || new Date().toISOString().split('T')[0]
      })),
      budgets: budgets
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    
    downloadFile(jsonContent, `financial-data-${timestamp}.json`, 'application/json');
    return { success: true, message: 'Data exported to JSON successfully!' };
  } catch (error) {
    console.error('JSON Export Error:', error);
    return { success: false, message: 'Failed to export JSON data' };
  }
};

/**
 * Gets a summary of the data to be exported
 */
export const getExportSummary = (transactions: Transaction[], budgets: Budget[]) => {
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

  return {
    transactionCount: transactions.length,
    budgetCount: budgets.length,
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalBudgetAmount,
    totalBudgetSpent,
    budgetUtilization: totalBudgetAmount > 0 ? (totalBudgetSpent / totalBudgetAmount) * 100 : 0
  };
};
