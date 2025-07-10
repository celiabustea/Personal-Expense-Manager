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
    console.time('🔄 selectAllTransactions');
    const result = [...transactions, ...recurring];
    console.timeEnd('🔄 selectAllTransactions');
    console.log(`🔄 selectAllTransactions: ${result.length} transactions`);
    return result;
  }
);

export const selectRecentTransactions = createSelector(
  [selectAllTransactions],
  (allTransactions) => {
    console.time('🔄 selectRecentTransactions');
    const result = [...allTransactions]
      .sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime())
      .slice(0, 5);
    console.timeEnd('🔄 selectRecentTransactions');
    console.log(`🔄 selectRecentTransactions: ${result.length} recent transactions`);
    return result;
  }
);

export const selectTotalBalance = createSelector(
  [selectAllTransactions],
  (transactions) => {
    console.time('🔄 selectTotalBalance');
    const result = transactions.reduce((sum, trans) => sum + trans.amount, 0);
    console.timeEnd('🔄 selectTotalBalance');
    console.log(`🔄 selectTotalBalance: $${result.toFixed(2)}`);
    return result;
  }
);

export const selectMonthlySpending = createSelector(
  [selectAllTransactions],
  (transactions) => {
    console.time('🔄 selectMonthlySpending');
    const result = transactions
      .filter(trans => trans.amount < 0)
      .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);
    console.timeEnd('🔄 selectMonthlySpending');
    console.log(`🔄 selectMonthlySpending: $${result.toFixed(2)}`);
    return result;
  }
);
