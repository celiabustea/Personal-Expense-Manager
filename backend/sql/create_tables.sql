-- Personal Expense Manager Database Schema
-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "budgets";
DROP TABLE IF EXISTS "transactions"; 
DROP TABLE IF EXISTS "events";
DROP TABLE IF EXISTS "users";
DROP TYPE IF EXISTS "public"."transactions_type_enum";
DROP TYPE IF EXISTS "public"."transactions_category_enum";
DROP TYPE IF EXISTS "public"."budgets_category_enum";

-- Create profiles table that links to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    default_currency text DEFAULT 'USD',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create budgets table with currency support
CREATE TABLE IF NOT EXISTS public.budgets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name text NOT NULL, -- User-friendly name like "Groceries", "Gas Money"
    category text NOT NULL, -- Category like "Food", "Transportation"
    amount numeric(12,2) NOT NULL, -- Increased precision for currency conversion
    currency text NOT NULL DEFAULT 'USD',
    period text DEFAULT 'monthly',
    spent numeric(12,2) DEFAULT 0, -- Track spending in budget's currency
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create transactions table with multi-currency support
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    budget_id uuid REFERENCES public.budgets(id) ON DELETE SET NULL, -- Optional budget link
    
    -- Transaction details
    amount numeric(12,2) NOT NULL, -- Amount in transaction currency
    description text NOT NULL,
    category text,
    type text CHECK (type IN ('income', 'expense')) NOT NULL,
    date date DEFAULT CURRENT_DATE,
    
    -- Currency details
    transaction_currency text NOT NULL DEFAULT 'USD',
    budget_currency text, -- Currency of the linked budget (if any)
    exchange_rate numeric(10,6), -- Rate used for conversion (if different currencies)
    budget_amount numeric(12,2), -- Amount deducted from budget (in budget's currency)
    
    -- Exchange metadata
    is_currency_exchange boolean DEFAULT false, -- Flag for cross-currency transactions
    exchange_provider text, -- API provider used (e.g., 'exchangerate-api')
    exchange_timestamp timestamptz, -- When rate was fetched
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create currency exchange rates cache table (optional optimization)
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    from_currency text NOT NULL,
    to_currency text NOT NULL,
    rate numeric(10,6) NOT NULL,
    provider text NOT NULL,
    fetched_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    UNIQUE(from_currency, to_currency, provider)
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_budget_id ON public.transactions(budget_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_exchange_rates_lookup ON public.exchange_rates(from_currency, to_currency);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exchange rates (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view exchange rates" ON public.exchange_rates
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role can manage exchange rates" ON public.exchange_rates
    FOR ALL USING (auth.role() = 'service_role');

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS trigger AS $$
BEGIN
    -- Only update if transaction is linked to a budget
    IF NEW.budget_id IS NOT NULL THEN
        -- Use budget_amount if available (for currency conversions), otherwise use amount
        UPDATE public.budgets 
        SET spent = spent + COALESCE(NEW.budget_amount, NEW.amount),
            updated_at = now()
        WHERE id = NEW.budget_id;
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
        -- Reverse the spent amount
        UPDATE public.budgets 
        SET spent = spent - COALESCE(OLD.budget_amount, OLD.amount),
            updated_at = now()
        WHERE id = OLD.budget_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic budget updates
CREATE TRIGGER transaction_insert_update_budget
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

CREATE TRIGGER transaction_delete_reverse_budget
    AFTER DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION reverse_budget_spent();

-- Function to handle new user signup (optional default budgets)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Always create profile
    INSERT INTO public.profiles (id, name, email, created_at, updated_at)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
        new.email, 
        now(), 
        now()
    );
    RAISE NOTICE 'Created profile for user: %', new.email;
    
    RETURN new;
   
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
