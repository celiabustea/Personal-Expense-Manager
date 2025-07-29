import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  loadUserDataToRedux, 
  saveTransactionToSupabase, 
  deleteTransactionFromSupabase,
  SupabaseTransaction 
} from '../../utils/supabaseIntegration';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  timestamp?: string;
  currency?: string;
  budgetId?: string;
  type?: 'income' | 'expense';
  isRecurring?: boolean;
  recurringFrequency?: string;
  // Multi-currency fields
  isExchange?: boolean;
  exchangeRate?: number;
  budgetAmount?: number;
  budgetCurrency?: string;
}

interface TransactionsState {
  items: Transaction[];
  recurring: Transaction[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

const initialState: TransactionsState = {
  items: [],
  recurring: [],
  loading: false,
  syncing: false,
  error: null,
  lastSyncTime: null,
};

// Async thunks for Supabase operations
export const addTransactionToSupabase = createAsyncThunk(
  'transactions/addToSupabase',
  async ({ transaction, userId }: { transaction: Omit<Transaction, 'id' | 'timestamp'>; userId: string }) => {
    const savedTransaction = await saveTransactionToSupabase(transaction, userId);
    return savedTransaction;
  }
);

export const deleteTransactionFromSupabaseThunk = createAsyncThunk(
  'transactions/deleteFromSupabase',
  async (transactionId: string) => {
    await deleteTransactionFromSupabase(transactionId);
    return transactionId;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Local state operations (for immediate UI updates)
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.push(action.payload);
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        transaction => transaction.id !== action.payload
      );
    },
    // Sync operations
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
      state.lastSyncTime = new Date().toISOString();
    },
    setSyncLoading: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addRecurringTransaction: (state, action: PayloadAction<Transaction>) => {
      state.recurring.push(action.payload);
    },
    deleteRecurringTransaction: (state, action: PayloadAction<string>) => {
      state.recurring = state.recurring.filter(
        transaction => transaction.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // Handle async thunk actions
    builder
      .addCase(addTransactionToSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransactionToSupabase.fulfilled, (state, action) => {
        state.loading = false;
        // Transform Supabase transaction to our format
        const newTransaction: Transaction = {
          id: action.payload.id,
          amount: action.payload.amount,
          description: action.payload.description,
          category: action.payload.category,
          date: action.payload.date,
          timestamp: action.payload.created_at,
          currency: action.payload.transaction_currency,
          budgetId: action.payload.budget_id || undefined,
          type: action.payload.type,
          isExchange: action.payload.is_currency_exchange,
          exchangeRate: action.payload.exchange_rate || undefined,
          budgetAmount: action.payload.budget_amount || undefined,
          budgetCurrency: action.payload.budget_currency || undefined,
        };
        state.items.push(newTransaction);
      })
      .addCase(addTransactionToSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save transaction';
      })
      .addCase(deleteTransactionFromSupabaseThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransactionFromSupabaseThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          transaction => transaction.id !== action.payload
        );
      })
      .addCase(deleteTransactionFromSupabaseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete transaction';
      });
  },
});

export const {
  addTransaction,
  deleteTransaction,
  setTransactions,
  setSyncLoading,
  setError,
  addRecurringTransaction,
  deleteRecurringTransaction,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
