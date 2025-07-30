# Budget Calculation Fix Instructions

## Problem
The budget remaining calculations were incorrect because:

1. **Database triggers were adding negative amounts directly**: When an expense transaction (-$50) was saved, the trigger did `spent = spent + (-50)`, resulting in negative spent amounts.

2. **Frontend was double-counting**: Local budget updates + database triggers were both updating the spent amount, causing double counting.

## Solution

### 1. Database Fix (Required)
Run the SQL script to fix the database triggers:

```bash
# Navigate to backend directory
cd backend

# Run the fix script (replace with your database credentials)
psql -h <your-supabase-host> -U postgres -d postgres -f sql/fix_budget_calculations.sql
```

Or apply it directly in your Supabase SQL editor by copying the contents of `backend/sql/fix_budget_calculations.sql`.

### 2. Frontend Fix (Already Applied)
The frontend code has been updated to:
- Remove local budget updates when using Supabase (database triggers handle this)
- Keep local budget updates only for offline/localStorage mode
- Prevent double-counting issues

## What the Fix Does

### Database Triggers Now:
- **Expense transactions** (-$50): Add absolute value to spent → `spent = spent + 50`
- **Income transactions** (+$100): Subtract absolute value from spent → `spent = spent - 100`
- **Never allow spent to go below 0**

### Frontend Now:
- **With Supabase**: Only saves transaction, lets database triggers update budgets
- **Without Supabase**: Updates both transaction and budget locally

## Testing
After applying the fix:

1. Create a test budget with $100 limit
2. Add an expense transaction of -$25
3. Check that:
   - Budget spent shows $25
   - Remaining shows $75
   - Transaction displays as -$25

## Expected Behavior
- **Transaction list**: Shows -$50.00 for expenses, +$100.00 for income
- **Budget spent**: Shows positive amounts (e.g., $25.00 spent)
- **Budget remaining**: Shows budget limit minus spent (e.g., $75.00 remaining)
