export type Role = 'owner' | 'admin' | 'manager' | 'staff';
export type CustomerStatus = 'active' | 'inactive' | 'lead';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'other';
export type SaleStatus = 'completed' | 'refunded' | 'pending';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type NotificationType = 'stock_alert' | 'invoice_overdue' | 'new_sale' | 'team' | 'system';
export type RecurrenceInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CustomFieldsConfig {
  customer_fields: string[];
  product_fields: string[];
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  currency: string;
  timezone: string;
  logo_url: string | null;
  team_size_bracket?: string;
  primary_goal?: string;
  onboarding_completed?: boolean;
  monthly_revenue_target?: number;
  monthly_profit_target?: number;
  custom_fields_config?: CustomFieldsConfig;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  business_id: string | null;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  theme_preference?: 'light' | 'dark' | 'system';
  dashboard_layout?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  total_spend: number;
  status: CustomerStatus;
  custom_fields?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  category: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  reorder_threshold: number;
  description: string | null;
  image_url: string | null;
  custom_fields?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface Sale {
  id: string;
  business_id: string;
  customer_id: string | null;
  sale_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  status: SaleStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  customer?: Customer;
  items?: SaleItem[];
}

export interface Expense {
  id: string;
  business_id: string;
  category: string;
  vendor: string;
  amount: number;
  expense_date: string;
  notes: string | null;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  is_recurring?: boolean;
  recurrence_interval?: RecurrenceInterval | null;
  next_issue_date?: string | null;
  auto_send?: boolean;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: InvoiceItem[];
}

export interface ActivityLog {
  id: string;
  business_id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  user_name?: string;
}

export interface Notification {
  id: string;
  business_id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface SavedFilter {
  id: string;
  business_id: string;
  user_id: string | null;
  table_name: 'customers' | 'inventory' | 'invoices' | 'sales';
  name: string;
  filter_criteria: Record<string, unknown>;
  created_at: string;
}
