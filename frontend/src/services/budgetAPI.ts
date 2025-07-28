// Budget API service for frontend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  limit: number;
  currency?: string;
  spent: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetRequest {
  name: string;
  amount: number;
  category: string;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

class BudgetAPIService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      // TODO: Add authorization header when auth is implemented
      // 'Authorization': `Bearer ${getAuthToken()}`
    };
  }

  async getBudgets(): Promise<Budget[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch budgets: ${response.statusText}`);
      }

      const budgets = await response.json();
      
      // Transform backend data to frontend format
      return budgets.map((budget: any) => ({
        ...budget,
        id: budget.id.toString(), // Convert numeric ID to string
        currency: budget.currency || 'USD', // Add default currency if missing
        limit: budget.amount // Map amount to limit for compatibility
      }));
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  }

  async getBudgetById(id: string): Promise<Budget> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch budget: ${response.statusText}`);
      }

      const budget = await response.json();
      
      // Transform backend data to frontend format
      return {
        ...budget,
        id: budget.id.toString(), // Convert numeric ID to string
        currency: budget.currency || 'USD', // Add default currency if missing
        limit: budget.amount // Map amount to limit for compatibility
      };
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
  }

  async createBudget(budgetData: CreateBudgetRequest): Promise<Budget> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create budget: ${response.statusText}`);
      }

      const budget = await response.json();
      
      // Transform backend data to frontend format
      return {
        ...budget,
        id: budget.id.toString(), // Convert numeric ID to string
        currency: budget.currency || 'USD', // Add default currency if missing
        limit: budget.amount // Map amount to limit for compatibility
      };
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async updateBudget(id: string, budgetData: UpdateBudgetRequest): Promise<Budget> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update budget: ${response.statusText}`);
      }

      const budget = await response.json();
      
      // Transform backend data to frontend format
      return {
        ...budget,
        id: budget.id.toString(), // Convert numeric ID to string
        currency: budget.currency || 'USD', // Add default currency if missing
        limit: budget.amount // Map amount to limit for compatibility
      };
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  async deleteBudget(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete budget: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  async updateBudgetSpent(id: string, amount: number): Promise<Budget> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}/spent`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update budget spent: ${response.statusText}`);
      }

      const budget = await response.json();
      return budget;
    } catch (error) {
      console.error('Error updating budget spent:', error);
      throw error;
    }
  }
}

export const budgetAPI = new BudgetAPIService();
