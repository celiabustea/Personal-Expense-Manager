// Utility functions for budget-transaction integration

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

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  limit: number;
  currency: string;
  spent: number;
}

/**
 * Finds a budget that matches the transaction category (which is now the budget name)
 * @param transaction - The transaction to match
 * @param budgets - Array of available budgets
 * @returns Matching budget or null
 */
export const findMatchingBudget = (transaction: Transaction, budgets: Budget[]): Budget | null => {
  if (!transaction.category || !budgets || budgets.length === 0) {
    return null;
  }
  
  return budgets.find(budget => 
    (budget.name && budget.name.toLowerCase().trim() === transaction.category.toLowerCase().trim()) ||
    (budget.category && budget.category.toLowerCase().trim() === transaction.category.toLowerCase().trim())
  ) || null;
};

/**
 * Calculates the budget spent change based on transaction amount
 * @param transactionAmount - The transaction amount (negative for spending, positive for income)
 * @returns The amount to add to budget.spent (only for expenses)
 */
export const calculateBudgetSpentChange = (transactionAmount: number): number => {
  // Only negative amounts (expenses) should count toward budget spent
  // Positive amounts (income) increase the budget amount itself, not affect spent
  return transactionAmount < 0 ? Math.abs(transactionAmount) : 0;
};

/**
 * Reverses a budget spent change (for transaction deletion)
 * @param transactionAmount - The original transaction amount
 * @returns The amount to reverse from budget.spent
 */
export const reverseBudgetSpentChange = (transactionAmount: number): number => {
  // Only reverse spending transactions (negative amounts)
  // Income transactions (positive amounts) don't affect budget spent
  return transactionAmount < 0 ? -Math.abs(transactionAmount) : 0;
};

/**
 * Calculates the budget amount change based on transaction amount
 * @param transactionAmount - The transaction amount (negative for spending, positive for income)
 * @returns The amount to add to budget.amount (only for income)
 */
export const calculateBudgetAmountChange = (transactionAmount: number): number => {
  // Only positive amounts (income) should increase budget amount
  // Negative amounts (expenses) don't affect the budget amount itself
  return transactionAmount > 0 ? transactionAmount : 0;
};

/**
 * Reverses a budget amount change (for transaction deletion)
 * @param transactionAmount - The original transaction amount
 * @returns The amount to reverse from budget.amount
 */
export const reverseBudgetAmountChange = (transactionAmount: number): number => {
  // Only reverse income transactions (positive amounts)
  return transactionAmount > 0 ? -transactionAmount : 0;
  return transactionAmount < 0 ? -Math.abs(transactionAmount) : 0;
};

/**
 * Gets budget update info for a transaction
 * @param transaction - The transaction
 * @param budgets - Array of available budgets
 * @param isReverse - Whether this is for deletion (reverse operation)
 * @returns Budget update info or null if no matching budget
 */
export const getBudgetUpdateInfo = (
  transaction: Transaction, 
  budgets: Budget[], 
  isReverse: boolean = false
): { budgetId: string; amount: number } | null => {
  if (!transaction.category || transaction.amount === 0) {
    return null;
  }

  const matchingBudget = findMatchingBudget(transaction, budgets);
  if (!matchingBudget) {
    return null;
  }

  const spentChange = isReverse 
    ? reverseBudgetSpentChange(transaction.amount)
    : calculateBudgetSpentChange(transaction.amount);

  return {
    budgetId: matchingBudget.id,
    amount: spentChange
  };
};

/**
 * Validates if a transaction can affect budgets
 * @param transaction - The transaction to validate
 * @returns true if transaction should affect budgets
 */
export const shouldUpdateBudget = (transaction: Transaction): boolean => {
  return !!(transaction.category && transaction.amount !== 0);
};

/**
 * Gets a summary of how a transaction will affect budgets
 * @param transaction - The transaction
 * @param budgets - Array of available budgets
 * @returns Summary object
 */
export const getTransactionBudgetImpact = (transaction: Transaction, budgets: Budget[]) => {
  const matchingBudget = findMatchingBudget(transaction, budgets);
  
  if (!matchingBudget || transaction.amount === 0) {
    return {
      hasImpact: false,
      budgetName: null,
      budgetCategory: null,
      impactType: null,
      impactAmount: 0
    };
  }

  const isSpending = transaction.amount < 0;
  const impactAmount = Math.abs(transaction.amount);

  return {
    hasImpact: true,
    budgetName: matchingBudget.name,
    budgetCategory: matchingBudget.category,
    impactType: isSpending ? 'spending' : 'income',
    impactAmount: impactAmount,
    newSpentAmount: matchingBudget.spent + calculateBudgetSpentChange(transaction.amount),
    newBudgetAmount: matchingBudget.amount + calculateBudgetAmountChange(transaction.amount)
  };
};

/**
 * Checks if a transaction would exceed the budget limit
 * @param transaction - The transaction to check
 * @param budget - The budget to check against
 * @returns true if transaction would exceed budget, false otherwise
 */
export const wouldExceedBudget = (transaction: Transaction, budget: Budget): boolean => {
  // Only check for spending transactions (negative amounts)
  if (transaction.amount >= 0) {
    return false;
  }
  
  const spentChange = Math.abs(transaction.amount);
  const newSpentTotal = (budget.spent || 0) + spentChange;
  
  return newSpentTotal > budget.amount;
};

/**
 * Gets budget overflow info for a transaction
 * @param transaction - The transaction to check
 * @param budget - The budget to check against
 * @returns overflow information or null if no overflow
 */
export const getBudgetOverflowInfo = (transaction: Transaction, budget: Budget) => {
  if (!wouldExceedBudget(transaction, budget)) {
    return null;
  }
  
  const spentChange = Math.abs(transaction.amount);
  const newSpentTotal = (budget.spent || 0) + spentChange;
  const overflowAmount = newSpentTotal - budget.amount;
  
  return {
    budgetName: budget.name || 'Unknown Budget',
    budgetLimit: budget.amount || 0,
    currentSpent: budget.spent || 0,
    transactionAmount: spentChange,
    newTotal: newSpentTotal,
    overflowAmount: overflowAmount
  };
};
