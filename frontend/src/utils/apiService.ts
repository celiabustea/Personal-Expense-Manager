import { supabase } from './supabase'

export interface Transaction {
  id?: string
  user_id: string
  amount: number
  description: string
  category: string
  type: 'income' | 'expense'
  date: string
  created_at?: string
}

export interface Budget {
  id?: string
  user_id: string
  category: string
  amount: number
  period: string
  created_at?: string
}

export class TransactionAPI {
  static async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    console.log('🔥 Creating transaction:', transaction)

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
        type: transaction.amount > 0 ? 'income' : 'expense'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Transaction creation failed:', error)
      throw error
    }
    
    console.log('✅ Transaction created:', data)
    return data
  }

  static async getTransactions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('❌ Failed to fetch transactions:', error)
      throw error
    }
    return data || []
  }

  static async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

export class BudgetAPI {
  static async getBudgets() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error
    return data || []
  }

  static async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budget,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}