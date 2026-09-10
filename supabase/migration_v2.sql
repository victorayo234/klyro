-- ==============================================================================
-- KLYRO SAAS MIGRATION V2: PERSONALIZATION, ONBOARDING, POWER FEATURES
-- ==============================================================================

-- 1. Businesses additions
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS team_size_bracket TEXT DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS primary_goal TEXT DEFAULT 'track_cashflow',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS monthly_revenue_target NUMERIC(12,2) DEFAULT 10000.00,
  ADD COLUMN IF NOT EXISTS monthly_profit_target NUMERIC(12,2) DEFAULT 4000.00,
  ADD COLUMN IF NOT EXISTS custom_fields_config JSONB DEFAULT '{"customer_fields":[], "product_fields":[]}'::jsonb;

-- 2. Profiles additions
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT NULL;

-- 3. Customers & Products custom_fields
ALTER TABLE public.customers 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- 4. Invoices recurring features
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_interval TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS next_issue_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_send BOOLEAN DEFAULT FALSE;

-- 5. Saved Filters Table
CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    name TEXT NOT NULL,
    filter_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_filters' AND policyname = 'Users can view saved filters in their business'
    ) THEN
        CREATE POLICY "Users can view saved filters in their business"
        ON public.saved_filters FOR SELECT
        USING (business_id = public.get_user_business_id());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_filters' AND policyname = 'Users can insert saved filters for their business'
    ) THEN
        CREATE POLICY "Users can insert saved filters for their business"
        ON public.saved_filters FOR INSERT
        WITH CHECK (business_id = public.get_user_business_id());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_filters' AND policyname = 'Users can delete their saved filters'
    ) THEN
        CREATE POLICY "Users can delete their saved filters"
        ON public.saved_filters FOR DELETE
        USING (user_id = auth.uid() OR public.get_user_role() IN ('owner', 'admin'));
    END IF;
END $$;
