import { configureStore } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import budgetsReducer from './slices/budgetsSlice';
import transactionsReducer from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    budgets: budgetsReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optimized selectors
export const selectTransactions = (state: RootState) => state.transactions.items;
export const selectRecurringTransactions = (state: RootState) => state.transactions.recurring;
export const selectBudgets = (state: RootState) => state.budgets.items;

// Memoized selectors for better performance
export const selectAllTransactions = createSelector(
  [selectTransactions, selectRecurringTransactions],
  (transactions, recurring) => {
    // Only create new array if data has actually changed
    return transactions.concat(recurring);
  }
);

export const selectRecentTransactions = createSelector(
  [selectAllTransactions],
  (allTransactions) => {
    return allTransactions
      .slice() // Create copy only for sorting
      .sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime())
      .slice(0, 5);
  }
);

export const selectTotalBalance = createSelector(
  [selectAllTransactions],
  (transactions) => {
    return transactions.reduce((sum, trans) => sum + trans.amount, 0);
  }
);

export const selectMonthlySpending = createSelector(
  [selectAllTransactions],
  (transactions) => {
    return transactions
      .filter(trans => trans.amount < 0)
      .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);
  }
);
