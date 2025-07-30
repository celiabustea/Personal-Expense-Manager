import { configureStore } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import budgetsReducer from './slices/budgetsSlice';
import transactionsReducer from './slices/transactionsSlice';
import { loadStateFromLocalStorage, saveStateToLocalStorage } from '../utils/localStorage';

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

// Function to load user-specific state (called after authentication)
export const loadUserState = (userId: string) => {
  if (typeof window !== 'undefined') {
    const persistedState = loadStateFromLocalStorage(userId);
    if (persistedState) {
      // Manually dispatch actions to restore user-specific state
      if (persistedState.transactions?.items) {
        store.dispatch({ type: 'transactions/setTransactions', payload: persistedState.transactions.items });
      }
      if (persistedState.budgets?.items) {
        store.dispatch({ type: 'budgets/setBudgets', payload: persistedState.budgets.items });
      }
    }
  }
};

// Function to clear user state (called on logout)
export const clearUserState = (userId: string) => {
  // Immediately clear Redux store to initial state
  store.dispatch({ type: 'transactions/setTransactions', payload: [] });
  store.dispatch({ type: 'budgets/setBudgets', payload: [] });
  
  // Clear localStorage for this user
  if (typeof window !== 'undefined') {
    const { clearStateFromLocalStorage } = require('../utils/localStorage');
    clearStateFromLocalStorage(userId);
  }
};

// Function to clear ALL user states (for complete reset)
export const clearAllUserStates = () => {
  // Immediately clear Redux store
  store.dispatch({ type: 'transactions/setTransactions', payload: [] });
  store.dispatch({ type: 'budgets/setBudgets', payload: [] });
  
  // Clear all localStorage data
  if (typeof window !== 'undefined') {
    const { clearStateFromLocalStorage } = require('../utils/localStorage');
    clearStateFromLocalStorage(); // Called without userId clears all
  }
};

// Setup localStorage persistence for a specific user
export const setupUserPersistence = (userId: string) => {
  if (typeof window !== 'undefined') {
    // Subscribe to store changes and save to user-specific localStorage
    const unsubscribe = store.subscribe(() => {
      saveStateToLocalStorage(store.getState(), userId);
    });
    
    return unsubscribe; // Return unsubscribe function for cleanup
  }
};

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
  [selectBudgets, selectAllTransactions],
  (budgets, transactions) => {
    // Calculate total budget amounts
    const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    
    // Calculate total spent from transactions (negative amounts = expenses)
    const totalSpent = transactions
      .filter(trans => trans.amount < 0)
      .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);
    
    // Remaining balance = Total Budget - Total Spent
    return totalBudgetAmount - totalSpent;
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
