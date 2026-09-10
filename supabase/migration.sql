-- ==============================================================================
-- KLYRO SAAS DATABASE MIGRATION & RLS POLICIES
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT DEFAULT 'General',
    currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'UTC',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff')) DEFAULT 'staff',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    total_spend NUMERIC(12,2) DEFAULT 0.00,
    status TEXT CHECK (status IN ('active', 'inactive', 'lead')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products / Inventory Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    cost_price NUMERIC(12,2) DEFAULT 0.00 CHECK (cost_price >= 0),
    sale_price NUMERIC(12,2) DEFAULT 0.00 CHECK (sale_price >= 0),
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    reorder_threshold INTEGER DEFAULT 5 CHECK (reorder_threshold >= 0),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, sku)
);

-- 5. Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    sale_date TIMESTAMPTZ DEFAULT NOW(),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(12,2) DEFAULT 0.00 CHECK (tax >= 0),
    discount NUMERIC(12,2) DEFAULT 0.00 CHECK (discount >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash', 'other')) DEFAULT 'credit_card',
    status TEXT CHECK (status IN ('completed', 'refunded', 'pending')) DEFAULT 'completed',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sale Items Table
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0)
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    vendor TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    expense_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    receipt_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    tax_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (tax_rate >= 0),
    tax_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, invoice_number)
);

-- 9. Invoice Items Table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0)
);

-- 10. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('stock_alert', 'invoice_overdue', 'new_sale', 'team', 'system')) DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_business ON public.profiles(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business ON public.sales(business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_business ON public.expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_business ON public.invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_activity_business ON public.activity_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_user ON public.notifications(business_id, user_id);

-- ==============================================================================
-- HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

-- Businesses policies
CREATE POLICY "Users can view their own business"
ON public.businesses FOR SELECT
USING (id = public.get_user_business_id());

CREATE POLICY "Owners and Admins can update their business"
ON public.businesses FOR UPDATE
USING (id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

CREATE POLICY "Owners can delete their business"
ON public.businesses FOR DELETE
USING (id = public.get_user_business_id() AND public.get_user_role() = 'owner');

-- Profiles policies
CREATE POLICY "Users can view profiles in their business"
ON public.profiles FOR SELECT
USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins and Owners can update any profile in their business"
ON public.profiles FOR UPDATE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

CREATE POLICY "Admins and Owners can delete staff profiles in their business"
ON public.profiles FOR DELETE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

-- Customers policies
CREATE POLICY "Users can view customers of their business"
ON public.customers FOR SELECT
USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert customers for their business"
ON public.customers FOR INSERT
WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update customers of their business"
ON public.customers FOR UPDATE
USING (business_id = public.get_user_business_id());

CREATE POLICY "Admins and Owners can delete customers"
ON public.customers FOR DELETE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

-- Products policies
CREATE POLICY "Users can view products of their business"
ON public.products FOR SELECT
USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert products for their business"
ON public.products FOR INSERT
WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update products of their business"
ON public.products FOR UPDATE
USING (business_id = public.get_user_business_id());

CREATE POLICY "Admins and Owners can delete products"
ON public.products FOR DELETE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

-- Sales policies
CREATE POLICY "Users can view sales of their business"
ON public.sales FOR SELECT
USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert sales for their business"
ON public.sales FOR INSERT
WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Admins and Owners can update sales"
ON public.sales FOR UPDATE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

-- Sale Items policies
CREATE POLICY "Users can view sale items of sales belonging to their business"
ON public.sale_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.sales
        WHERE sales.id = sale_items.sale_id AND sales.business_id = public.get_user_business_id()
    )
);

CREATE POLICY "Users can insert sale items for sales of their business"
ON public.sale_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sales
        WHERE sales.id = sale_items.sale_id AND sales.business_id = public.get_user_business_id()
    )
);

-- Expenses policies
CREATE POLICY "Users can view expenses of their business"
ON public.expenses FOR SELECT
USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert expenses for their business"
ON public.expenses FOR INSERT
WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Admins and Owners can update expenses"
ON public.expenses FOR UPDATE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

CREATE POLICY "Admins and Owners can delete expenses"
ON public.expenses FOR DELETE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

-- Invoices policies
CREATE POLICY "Users can view invoices of their business"
ON public.invoices FOR SELECT
USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert invoices for their business"
ON public.invoices FOR INSERT
WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update invoices of their business"
ON public.invoices FOR UPDATE
USING (business_id = public.get_user_business_id());

CREATE POLICY "Admins and Owners can delete invoices"
ON public.invoices FOR DELETE
USING (business_id = public.get_user_business_id() AND public.get_user_role() IN ('owner', 'admin'));

-- Invoice Items policies
CREATE POLICY "Users can view invoice items for their business"
ON public.invoice_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id AND invoices.business_id = public.get_user_business_id()
    )
);

CREATE POLICY "Users can insert invoice items for their business"
ON public.invoice_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id AND invoices.business_id = public.get_user_business_id()
    )
);

-- Activity Logs policies
CREATE POLICY "Users can view activity logs of their business"
ON public.activity_logs FOR SELECT
USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert activity logs for their business"
ON public.activity_logs FOR INSERT
WITH CHECK (business_id = public.get_user_business_id());

-- Notifications policies
CREATE POLICY "Users can view their notifications or business notifications"
ON public.notifications FOR SELECT
USING (business_id = public.get_user_business_id() AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- ==============================================================================
-- TRIGGERS & BUSINESS LOGIC
-- ==============================================================================

-- 1. Auto-decrement product quantity on sale item insert
CREATE OR REPLACE FUNCTION public.handle_sale_item_stock_decrement()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET quantity = GREATEST(0, quantity - NEW.quantity),
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sale_item_stock_decrement ON public.sale_items;
CREATE TRIGGER tr_sale_item_stock_decrement
AFTER INSERT ON public.sale_items
FOR EACH ROW
WHEN (NEW.product_id IS NOT NULL)
EXECUTE FUNCTION public.handle_sale_item_stock_decrement();

-- 2. Update customer total spend on sale completion
CREATE OR REPLACE FUNCTION public.handle_sale_customer_spend_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE public.customers
        SET total_spend = total_spend + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sale_customer_spend ON public.sales;
CREATE TRIGGER tr_sale_customer_spend
AFTER INSERT ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_sale_customer_spend_update();
