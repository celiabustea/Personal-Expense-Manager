// AI utility functions for financial analysis

interface AIAnalysisResponse {
  suggestions: string[];
  question: string;
  encouragement: string;
}

interface AIServiceResponse {
  success: boolean;
  data?: AIAnalysisResponse;
  message?: string;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Analyzes financial data using AI
 */
export const analyzeFinancialData = async (
  exportData: string, 
  format: 'csv' | 'json'
): Promise<AIServiceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exportData,
        format
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to analyze data');
    }

    return result;
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to connect to AI service'
    };
  }
};

/**
 * Checks if AI service is available
 */
export const checkAIServiceHealth = async (): Promise<{
  ollamaAvailable: boolean;
  mistralInstalled: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/health`);
    const result = await response.json();
    
    return {
      ollamaAvailable: result.ollamaAvailable || false,
      mistralInstalled: result.mistralInstalled || false,
      error: result.error
    };
  } catch (error: any) {
    console.error('AI Health Check Error:', error);
    return {
      ollamaAvailable: false,
      mistralInstalled: false,
      error: error.message
    };
  }
};

/**
 * Prepares financial data for AI analysis without triggering download
 */
export const prepareFinancialDataForAI = (
  transactions: any[], 
  budgets: any[], 
  format: 'csv' | 'json'
): string => {
  if (format === 'json') {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalTransactions: transactions.length,
      totalBudgets: budgets.length,
      transactions: transactions.map(t => ({
        ...t,
        date: t.date || t.timestamp || new Date().toISOString().split('T')[0]
      })),
      budgets: budgets
    };
    return JSON.stringify(exportData, null, 2);
  } else {
    // CSV format
    let csvContent = '';
    
    // Add metadata
    csvContent += `Financial Data Export\n`;
    csvContent += `Export Date,${new Date().toLocaleDateString()}\n`;
    csvContent += `Total Transactions,${transactions.length}\n`;
    csvContent += `Total Budgets,${budgets.length}\n\n`;

    // Export transactions
    if (transactions.length > 0) {
      csvContent += `TRANSACTIONS\n`;
      csvContent += 'id,date,description,category,amount,currency,isRecurring,recurringFrequency\n';
      
      transactions.forEach(t => {
        const row = [
          t.id || '',
          t.date || t.timestamp || '',
          (t.description || '').replace(/,/g, ';'),
          t.category || '',
          t.amount || 0,
          t.currency || 'USD',
          t.isRecurring || false,
          t.recurringFrequency || ''
        ].join(',');
        csvContent += row + '\n';
      });
      csvContent += '\n';
    }

    // Export budgets
    if (budgets.length > 0) {
      csvContent += `BUDGETS\n`;
      csvContent += 'id,name,category,amount,limit,spent,currency\n';
      
      budgets.forEach(b => {
        const row = [
          b.id || '',
          (b.name || '').replace(/,/g, ';'),
          b.category || '',
          b.amount || 0,
          b.limit || 0,
          b.spent || 0,
          b.currency || 'USD'
        ].join(',');
        csvContent += row + '\n';
      });
    }

    return csvContent;
  }
};
