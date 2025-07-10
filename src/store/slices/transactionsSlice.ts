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
  items: [
    {
      id: '1',
      amount: 1500,
      description: 'Salary',
      category: 'Income',
      date: '2024-01-15',
      timestamp: '2024-01-15T10:00:00Z',
      currency: 'USD',
    },
    {
      id: '2',
      amount: -85.50,
      description: 'Grocery Shopping',
      category: 'Food',
      date: '2024-01-14',
      timestamp: '2024-01-14T14:30:00Z',
      currency: 'USD',
    },
    {
      id: '3',
      amount: -45.00,
      description: 'Coffee Shop',
      category: 'Food',
      date: '2024-01-13',
      timestamp: '2024-01-13T09:15:00Z',
      currency: 'USD',
    },
  ],
  recurring: [
    {
      id: '4',
      amount: -120.00,
      description: 'Monthly Gym Membership',
      category: 'Health',
      date: '2024-01-01',
      timestamp: '2024-01-01T00:00:00Z',
      currency: 'USD',
      isRecurring: true,
      recurringFrequency: 'Monthly',
    },
    {
      id: '5',
      amount: -50.00,
      description: 'Netflix Subscription',
      category: 'Entertainment',
      date: '2024-01-01',
      timestamp: '2024-01-01T00:00:00Z',
      currency: 'USD',
      isRecurring: true,
      recurringFrequency: 'Monthly',
    },
  ],
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
