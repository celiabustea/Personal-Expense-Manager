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
  items: [],
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
