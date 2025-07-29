// Transaction API service for frontend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

export interface CreateTransactionRequest {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

export interface UpdateTransactionRequest {
  amount?: number;
  type?: 'income' | 'expense';
  category?: string;
  description?: string;
  date?: string;
}

class TransactionAPIService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      // TODO: Add authorization header when auth is implemented
      // 'Authorization': `Bearer ${getAuthToken()}`
    };
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const transactions = await response.json();
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const transaction = await response.json();
      return transaction;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const transaction = await response.json();
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, transactionData: UpdateTransactionRequest): Promise<Transaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const transaction = await response.json();
      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Get transactions by category
  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions();
      return transactions.filter(transaction => transaction.category === category);
    } catch (error) {
      console.error('Error fetching transactions by category:', error);
      throw error;
    }
  }

  // Get transactions by type (income/expense)
  async getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions();
      return transactions.filter(transaction => transaction.type === type);
    } catch (error) {
      console.error('Error fetching transactions by type:', error);
      throw error;
    }
  }

  // Get transactions within date range
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions();
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const transactionAPI = new TransactionAPIService();
export default transactionAPI;
