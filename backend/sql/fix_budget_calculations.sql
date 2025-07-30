-- Fix budget calculation triggers
-- This script fixes the budget spent calculation to handle negative transaction amounts correctly

-- Drop existing triggers
DROP TRIGGER IF EXISTS transaction_insert_update_budget ON public.transactions;
DROP TRIGGER IF EXISTS transaction_delete_reverse_budget ON public.transactions;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_budget_spent();
DROP FUNCTION IF EXISTS reverse_budget_spent();

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS trigger AS $$
BEGIN
    -- Only update if transaction is linked to a budget
    IF NEW.budget_id IS NOT NULL THEN
        -- For expense transactions (negative amounts): add absolute value to spent
        -- For income transactions (positive amounts): subtract from spent (but don't go below 0)
        IF NEW.type = 'expense' THEN
            -- Add absolute value of expense to spent
            UPDATE public.budgets 
            SET spent = spent + ABS(COALESCE(NEW.budget_amount, NEW.amount)),
                updated_at = now()
            WHERE id = NEW.budget_id;
        ELSIF NEW.type = 'income' THEN
            -- Subtract income from spent (but don't go below 0)
            UPDATE public.budgets 
            SET spent = GREATEST(0, spent - ABS(COALESCE(NEW.budget_amount, NEW.amount))),
                updated_at = now()
            WHERE id = NEW.budget_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reverse budget spent on transaction deletion
CREATE OR REPLACE FUNCTION reverse_budget_spent()
RETURNS trigger AS $$
BEGIN
    -- Only update if transaction was linked to a budget
    IF OLD.budget_id IS NOT NULL THEN
        -- For expense transactions (negative amounts): subtract absolute value from spent
        -- For income transactions (positive amounts): add back to spent
        IF OLD.type = 'expense' THEN
            -- Subtract absolute value of expense from spent
            UPDATE public.budgets 
            SET spent = GREATEST(0, spent - ABS(COALESCE(OLD.budget_amount, OLD.amount))),
                updated_at = now()
            WHERE id = OLD.budget_id;
        ELSIF OLD.type = 'income' THEN
            -- Add back income to spent (reverse the subtraction)
            UPDATE public.budgets 
            SET spent = spent + ABS(COALESCE(OLD.budget_amount, OLD.amount)),
                updated_at = now()
            WHERE id = OLD.budget_id;
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
CREATE TRIGGER transaction_insert_update_budget
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

CREATE TRIGGER transaction_delete_reverse_budget
    AFTER DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION reverse_budget_spent();

-- Reset all budget spent amounts to recalculate correctly
-- This will fix any existing incorrect spent amounts
UPDATE public.budgets 
SET spent = (
    SELECT COALESCE(SUM(
        CASE 
            WHEN t.type = 'expense' THEN ABS(COALESCE(t.budget_amount, t.amount))
            WHEN t.type = 'income' THEN -ABS(COALESCE(t.budget_amount, t.amount))
            ELSE 0
        END
    ), 0)
    FROM public.transactions t 
    WHERE t.budget_id = budgets.id
),
updated_at = now();

-- Ensure spent amounts don't go below 0
UPDATE public.budgets 
SET spent = GREATEST(0, spent),
    updated_at = now()
WHERE spent < 0;
