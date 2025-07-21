import { supabase } from '../config/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id?: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at?: string;
}

export interface Budget {
  id?: string;
  user_id: string;
  category: string;
  amount: number;
  period: string;
  created_at?: string;
}

// User service
export class UserService {
  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  // Create new user
  static async createUser(
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  // Update user
  static async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'created_at'>>,
  ): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }
}

// Transaction service
export class TransactionService {
  // Get all transactions for a user
  static async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  // Create new transaction
  static async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'created_at'>,
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          ...transactionData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    return data;
  }

  // Update transaction
  static async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>,
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return null;
    }

    return data;
  }

  // Delete transaction
  static async deleteTransaction(transactionId: string): Promise<boolean> {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);

    if (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }

    return true;
  }
}

// Budget service
export class BudgetService {
  // Get all budgets for a user
  static async getBudgetsByUserId(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }

    return data || [];
  }

  // Create new budget
  static async createBudget(budgetData: Omit<Budget, 'id' | 'created_at'>): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([
        {
          ...budgetData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      return null;
    }

    return data;
  }

  // Update budget
  static async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return null;
    }

    return data;
  }

  // Delete budget
  static async deleteBudget(budgetId: string): Promise<boolean> {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);

    if (error) {
      console.error('Error deleting budget:', error);
      return false;
    }

    return true;
  }
}
