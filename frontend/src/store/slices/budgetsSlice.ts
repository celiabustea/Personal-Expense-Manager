import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { budgetAPI, Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../../services/budgetAPI';
import { saveBudgetToSupabase, SupabaseBudget } from '../../utils/supabaseIntegration';

// Helper function to calculate budget end date based on period
function calculateEndDate(startDate: string, period: string): string {
  const start = new Date(startDate)
  
  switch (period) {
    case 'weekly':
      start.setDate(start.getDate() + 7)
      break
    case 'monthly':
      start.setMonth(start.getMonth() + 1)
      break
    case 'yearly':
      start.setFullYear(start.getFullYear() + 1)
      break
    default:
      start.setMonth(start.getMonth() + 1) // Default to monthly
  }
  
  return start.toISOString().split('T')[0]
}

interface BudgetsState {
  items: Budget[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

const initialState: BudgetsState = {
  items: [],
  loading: false,
  syncing: false,
  error: null,
  lastSyncTime: null,
};

// Async thunks for Supabase operations
export const createBudgetInSupabase = createAsyncThunk(
  'budgets/createInSupabase',
  async ({ budget, userId }: { budget: Omit<Budget, 'id' | 'spent'>; userId: string }) => {
    const savedBudget = await saveBudgetToSupabase(budget, userId);
    return savedBudget;
  }
);

// Legacy API thunks (keep for compatibility)
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const budgets = await budgetAPI.getBudgets();
      return budgets;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch budgets');
    }
  }
);

export const createBudgetAsync = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: CreateBudgetRequest, { rejectWithValue }) => {
    try {
      const budget = await budgetAPI.createBudget(budgetData);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create budget');
    }
  }
);

export const updateBudgetAsync = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data }: { id: string; data: UpdateBudgetRequest }, { rejectWithValue }) => {
    try {
      const budget = await budgetAPI.updateBudget(id, data);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update budget');
    }
  }
);

export const deleteBudgetAsync = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      await budgetAPI.deleteBudget(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete budget');
    }
  }
);

export const updateBudgetSpentAsync = createAsyncThunk(
  'budgets/updateBudgetSpent',
  async ({ id, amount }: { id: string; amount: number }, { rejectWithValue }) => {
    try {
      const budget = await budgetAPI.updateBudgetSpent(id, amount);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update budget spent');
    }
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    // Keep existing synchronous actions for backward compatibility
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.items.push(action.payload);
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(budget => budget.id !== action.payload);
    },
    // Sync operations
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.items = action.payload;
      state.lastSyncTime = new Date().toISOString();
    },
    setSyncLoading: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Supabase operations
    builder
      .addCase(createBudgetInSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBudgetInSupabase.fulfilled, (state, action) => {
        state.loading = false;
        // Transform Supabase budget to our format
        const newBudget: Budget = {
          id: action.payload.id,
          name: action.payload.name,
          category: action.payload.category,
          amount: action.payload.amount,
          spent: action.payload.spent,
          limit: action.payload.amount,
          currency: action.payload.currency || 'USD',
          startDate: action.payload.created_at.split('T')[0],
          endDate: calculateEndDate(action.payload.created_at, action.payload.period)
        };
        state.items.push(newBudget);
      })
      .addCase(createBudgetInSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create budget';
      })
    // Legacy API operations (keep for backward compatibility)
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create budget
    builder
      .addCase(createBudgetAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBudgetAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createBudgetAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update budget
    builder
      .addCase(updateBudgetAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudgetAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateBudgetAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete budget
    builder
      .addCase(deleteBudgetAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudgetAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(budget => budget.id !== action.payload);
      })
      .addCase(deleteBudgetAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update budget spent
    builder
      .addCase(updateBudgetSpentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudgetSpentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateBudgetSpentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  addBudget, 
  deleteBudget, 
  setBudgets,
  setSyncLoading,
  updateBudgetSpent, 
  clearError 
} = budgetsSlice.actions;

export default budgetsSlice.reducer;
