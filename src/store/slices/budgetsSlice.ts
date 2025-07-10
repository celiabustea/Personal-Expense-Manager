import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  limit: number;
  currency: string;
  spent: number;
}

interface BudgetsState {
  items: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  items: [
    {
      id: '1',
      name: 'Food Budget',
      category: 'Food',
      amount: 500,
      limit: 500,
      currency: 'USD',
      spent: 130.50,
    },
    {
      id: '2',
      name: 'Health Budget',
      category: 'Health',
      amount: 200,
      limit: 200,
      currency: 'USD',
      spent: 120.00,
    },
    {
      id: '3',
      name: 'Entertainment Budget',
      category: 'Entertainment',
      amount: 100,
      limit: 100,
      currency: 'USD',
      spent: 50.00,
    },
  ],
  loading: false,
  error: null,
};

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.items.push(action.payload);
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(budget => budget.id !== action.payload);
    },
    updateBudgetSpent: (
      state,
      action: PayloadAction<{ budgetId: string; amount: number }>
    ) => {
      const { budgetId, amount } = action.payload;
      const budget = state.items.find(b => b.id === budgetId);
      if (budget) {
        budget.spent = (budget.spent || 0) + amount;
      }
    },
  },
});

export const { addBudget, deleteBudget, updateBudgetSpent } =
  budgetsSlice.actions;
export default budgetsSlice.reducer;
