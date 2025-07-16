import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface TransactionsState {
  items: Transaction[];
  recurring: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  recurring: [],
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.push(action.payload);
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        transaction => transaction.id !== action.payload
      );
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
});

export const {
  addTransaction,
  deleteTransaction,
  addRecurringTransaction,
  deleteRecurringTransaction,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
