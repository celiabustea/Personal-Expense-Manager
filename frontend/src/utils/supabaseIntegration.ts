import { supabase } from './supabase'
import { Dispatch } from '@reduxjs/toolkit'
import { setBudgets } from '../store/slices/budgetsSlice'
import { setTransactions } from '../store/slices/transactionsSlice'
import { setUserProfile } from '../store/slices/userSlice'

// Types for database entities
export interface SupabaseTransaction {
  id: string
  user_id: string
  budget_id?: string
  amount: number
  description: string
  category: string
  type: 'income' | 'expense'
  date: string
  transaction_currency: string
  budget_currency?: string
  exchange_rate?: number
  budget_amount?: number
  is_currency_exchange: boolean
  created_at: string
  updated_at: string
}

export interface SupabaseBudget {
  id: string
  user_id: string
  name: string
  category: string
  amount: number
  currency: string
  period: string
  spent: number
  created_at: string
  updated_at: string
}

export interface SupabaseProfile {
  id: string
  name: string
  email: string
  default_currency: string
  created_at: string
  updated_at: string
}

/**
 * Load user data from Supabase and sync to Redux store
 * 
 * @param userId - The authenticated user's ID
 * @param dispatch - Redux dispatch function
 */
export const loadUserDataToRedux = async (userId: string, dispatch: Dispatch) => {
  try {
    console.log('🔄 Loading user data from Supabase to Redux...')
    
    // Load budgets from Supabase
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (budgetError) {
      console.error('❌ Failed to load budgets:', budgetError)
    } else {
      console.log('✅ Loaded budgets from Supabase:', budgets)
      
      // Transform Supabase budget data to Redux format
      const transformedBudgets = budgets.map((budget: SupabaseBudget) => ({
        id: budget.id,
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        spent: budget.spent,
        limit: budget.amount,
        currency: budget.currency || 'USD',
        period: budget.period,
        startDate: budget.created_at.split('T')[0], // Extract date part
        endDate: calculateEndDate(budget.created_at, budget.period)
      }))

      // Dispatch to Redux
      dispatch(setBudgets(transformedBudgets))
      console.log('📊 Transformed budgets for Redux:', transformedBudgets)
    }

    // Load transactions from Supabase
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(100) // Limit for performance

    if (transactionError) {
      console.error('❌ Failed to load transactions:', transactionError)
    } else {
      console.log('✅ Loaded transactions from Supabase:', transactions)
      
      // Transform Supabase transaction data to Redux format
      const transformedTransactions = transactions.map((transaction: SupabaseTransaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        budgetId: transaction.budget_id,
        timestamp: transaction.created_at,
        currency: transaction.transaction_currency || 'USD',
        type: transaction.type,
        // Multi-currency fields
        isExchange: transaction.is_currency_exchange,
        exchangeRate: transaction.exchange_rate,
        budgetAmount: transaction.budget_amount,
        budgetCurrency: transaction.budget_currency
      }))

      // Dispatch to Redux
      dispatch(setTransactions(transformedTransactions))
      console.log('💰 Transformed transactions for Redux:', transformedTransactions)
    }

    // Load user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('❌ Failed to load profile:', profileError)
    } else {
      console.log('✅ Loaded profile from Supabase:', profile)
      // Dispatch profile data to Redux
      dispatch(setUserProfile({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        defaultCurrency: profile.default_currency || 'USD',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }))
    }

  } catch (error) {
    console.error('❌ Error loading user data to Redux:', error)
  }
}

/**
 * Save a new transaction to Supabase
 * 
 * @param transaction - Transaction data to save
 * @param userId - The authenticated user's ID
 * @returns Promise with saved transaction data
 */
export const saveTransactionToSupabase = async (
  transaction: {
    amount: number
    description: string
    category: string
    date: string
    budgetId?: string
    currency?: string
    isExchange?: boolean
    exchangeRate?: number
    budgetAmount?: number
    budgetCurrency?: string
  },
  userId: string
): Promise<SupabaseTransaction> => {
  try {
    console.log('💾 Saving transaction to Supabase:', transaction)

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        budget_id: transaction.budgetId || null,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        type: transaction.amount > 0 ? 'income' : 'expense',
        date: transaction.date,
        transaction_currency: transaction.currency || 'USD',
        budget_currency: transaction.budgetCurrency || null,
        exchange_rate: transaction.exchangeRate || null,
        budget_amount: transaction.budgetAmount || null,
        is_currency_exchange: transaction.isExchange || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to save transaction:', error)
      throw error
    }

    console.log('✅ Transaction saved to Supabase:', data)
    return data as SupabaseTransaction
  } catch (error) {
    console.error('❌ Error saving transaction:', error)
    throw error
  }
}

/**
 * Save a new budget to Supabase
 * 
 * @param budget - Budget data to save
 * @param userId - The authenticated user's ID
 * @returns Promise with saved budget data
 */
export const saveBudgetToSupabase = async (
  budget: {
    name: string
    category: string
    amount: number
    currency?: string
    period?: string
  },
  userId: string
): Promise<SupabaseBudget> => {
  try {
    console.log('💾 Saving budget to Supabase:', budget)

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        currency: budget.currency || 'USD',
        period: budget.period || 'monthly',
        spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to save budget:', error)
      throw error
    }

    console.log('✅ Budget saved to Supabase:', data)
    return data as SupabaseBudget
  } catch (error) {
    console.error('❌ Error saving budget:', error)
    throw error
  }
}

/**
 * Delete a transaction from Supabase
 * 
 * @param transactionId - ID of transaction to delete
 * @returns Promise with success status
 */
export const deleteTransactionFromSupabase = async (transactionId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting transaction from Supabase:', transactionId)

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) {
      console.error('❌ Failed to delete transaction:', error)
      throw error
    }

    console.log('✅ Transaction deleted from Supabase')
    return true
  } catch (error) {
    console.error('❌ Error deleting transaction:', error)
    throw error
  }
}

/**
 * Helper function to calculate budget end date based on period
 */
function calculateEndDate(startDate: string, period: string): string {
  const start = new Date(startDate)
  
  switch (period) {
    case 'weekly':
      start.setDate(start.getDate() + 7)
      break
    case 'monthly':
      start.setMonth(start.getMonth() + 1)
      break
    case 'yearly':
      start.setFullYear(start.getFullYear() + 1)
      break
    default:
      start.setMonth(start.getMonth() + 1) // Default to monthly
  }
  
  return start.toISOString().split('T')[0]
}

/**
 * Set up real-time subscriptions for user data
 * 
 * @param userId - The authenticated user's ID
 * @param dispatch - Redux dispatch function
 * @returns Cleanup function to remove subscriptions
 */
export const setupRealtimeSubscriptions = (userId: string, dispatch: Dispatch) => {
  console.log('🔄 Setting up real-time subscriptions for user:', userId)

  // Subscribe to budget changes
  const budgetSubscription = supabase
    .channel('budgets_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'budgets',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🔄 Budget change detected:', payload)
        // Reload budgets data
        loadUserDataToRedux(userId, dispatch)
      }
    )
    .subscribe()

  // Subscribe to transaction changes
  const transactionSubscription = supabase
    .channel('transactions_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🔄 Transaction change detected:', payload)
        // Reload transactions data
        loadUserDataToRedux(userId, dispatch)
      }
    )
    .subscribe()

  // Return cleanup function
  return () => {
    console.log('🧹 Cleaning up real-time subscriptions')
    budgetSubscription.unsubscribe()
    transactionSubscription.unsubscribe()
  }
}
