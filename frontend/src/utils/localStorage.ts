// Simple localStorage utilities for persisting Redux state per user
export const saveStateToLocalStorage = (state: any, userId?: string) => {
  try {
    if (typeof window !== 'undefined') {
      const serializedState = JSON.stringify(state);
      // Use user-specific key to isolate data between users
      const storageKey = userId ? `expense-manager-state-${userId}` : 'expense-manager-state-anonymous';
      localStorage.setItem(storageKey, serializedState);
    }
  } catch (error) {
    console.warn('Could not save state to localStorage:', error);
    // Clear potentially corrupted data
    clearStateFromLocalStorage(userId);
  }
};

export const loadStateFromLocalStorage = (userId?: string) => {
  try {
    if (typeof window !== 'undefined') {
      // Use user-specific key to isolate data between users
      const storageKey = userId ? `expense-manager-state-${userId}` : 'expense-manager-state-anonymous';
      const serializedState = localStorage.getItem(storageKey);
      if (serializedState === null) {
        return undefined;
      }
      const parsed = JSON.parse(serializedState);
      console.log(`📦 Loaded state from localStorage for user ${userId || 'anonymous'}:`, parsed);
      return parsed;
    }
  } catch (error) {
    console.warn('Could not load state from localStorage:', error);
    // Clear corrupted data
    clearStateFromLocalStorage(userId);
    return undefined;
  }
  return undefined;
};

export const clearStateFromLocalStorage = (userId?: string) => {
  try {
    if (typeof window !== 'undefined') {
      if (userId) {
        // Clear user-specific state
        localStorage.removeItem(`expense-manager-state-${userId}`);
      } else {
        // Clear all expense manager states (useful for complete logout)
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('expense-manager-state')) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  } catch (error) {
    console.warn('Could not clear state from localStorage:', error);
  }
};
