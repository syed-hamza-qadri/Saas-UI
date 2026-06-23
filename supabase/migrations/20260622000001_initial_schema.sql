-- UUID generation uses gen_random_uuid() built into Supabase PostgreSQL 17

-- CATEGORIES
create table public.categories (
id uuid primary key default gen_random_uuid(),
name text not null,
color text not null default '#702bf0',
created_at timestamptz not null default now()
);

-- PRODUCTS
create table public.products (
id uuid primary key default gen_random_uuid(),
name text not null,
sku text not null unique,
barcode text unique,
price numeric(10,2) not null check (price >= 0),
cost numeric(10,2) not null default 0 check (cost >= 0),
category_id uuid references public.categories(id) on delete set null,
stock_qty integer not null default 0 check (stock_qty >= 0),
low_stock_threshold integer not null default 10,
image_url text,
is_active boolean not null default true,
created_at timestamptz not null default now()
);

-- CUSTOMERS
create table public.customers (
id uuid primary key default gen_random_uuid(),
name text not null,
phone text unique,
email text unique,
loyalty_points integer not null default 0,
total_spent numeric(12,2) not null default 0,
created_at timestamptz not null default now()
);

-- USERS (cashiers/admins - separate from Supabase Auth)
create table public.users (
id uuid primary key default gen_random_uuid(),
auth_id uuid unique references auth.users(id) on delete cascade,
name text not null,
email text unique,
role text not null check (role in ('admin', 'manager', 'cashier')),
pin_hash text,
active boolean not null default true,
created_at timestamptz not null default now()
);

-- ORDERS
create table public.orders (
id uuid primary key default gen_random_uuid(),
order_number text not null unique,
cashier_id uuid references public.users(id) on delete set null,
customer_id uuid references public.customers(id) on delete set null,
subtotal numeric(12,2) not null default 0,
tax numeric(12,2) not null default 0,
discount numeric(12,2) not null default 0,
total numeric(12,2) not null default 0,
status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'voided')),
payment_method text not null check (payment_method in ('cash', 'card', 'bank_transfer', 'split')),
notes text,
created_at timestamptz not null default now()
);

-- ORDER ITEMS
create table public.order_items (
id uuid primary key default gen_random_uuid(),
order_id uuid not null references public.orders(id) on delete cascade,
product_id uuid references public.products(id) on delete set null,
product_name text not null,
quantity integer not null check (quantity > 0),
unit_price numeric(10,2) not null,
discount numeric(10,2) not null default 0,
subtotal numeric(10,2) not null,
created_at timestamptz not null default now()
);

-- PAYMENTS
create table public.payments (
id uuid primary key default gen_random_uuid(),
order_id uuid not null references public.orders(id) on delete cascade,
method text not null check (method in ('cash', 'card', 'bank_transfer')),
amount numeric(12,2) not null check (amount > 0),
reference text,
status text not null default 'success' check (status in ('success', 'failed', 'refunded')),
created_at timestamptz not null default now()
);

-- AUDIT LOGS
create table public.audit_logs (
id uuid primary key default gen_random_uuid(),
user_id uuid references public.users(id) on delete set null,
action text not null,
table_name text not null,
record_id uuid,
old_value jsonb,
new_value jsonb,
created_at timestamptz not null default now()
);

-- INDEXES for performance
create index idx_products_sku on public.products(sku);
create index idx_products_barcode on public.products(barcode);
create index idx_products_category on public.products(category_id);
create index idx_products_is_active on public.products(is_active);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at desc);
create index idx_orders_cashier on public.orders(cashier_id);
create index idx_order_items_order on public.order_items(order_id);
create index idx_payments_order on public.payments(order_id);
create index idx_audit_logs_user on public.audit_logs(user_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- ROW LEVEL SECURITY
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

-- RLS POLICIES (authenticated users can read/write)
create policy "Authenticated users can read categories" on public.categories for select to authenticated using (true);
create policy "Authenticated users can manage categories" on public.categories for all to authenticated using (true);

create policy "Authenticated users can read products" on public.products for select to authenticated using (true);
create policy "Authenticated users can manage products" on public.products for all to authenticated using (true);

create policy "Authenticated users can read customers" on public.customers for select to authenticated using (true);
create policy "Authenticated users can manage customers" on public.customers for all to authenticated using (true);

create policy "Authenticated users can read users" on public.users for select to authenticated using (true);
create policy "Authenticated users can manage users" on public.users for all to authenticated using (true);

create policy "Authenticated users can read orders" on public.orders for select to authenticated using (true);
create policy "Authenticated users can manage orders" on public.orders for all to authenticated using (true);

create policy "Authenticated users can read order_items" on public.order_items for select to authenticated using (true);
create policy "Authenticated users can manage order_items" on public.order_items for all to authenticated using (true);

create policy "Authenticated users can read payments" on public.payments for select to authenticated using (true);
create policy "Authenticated users can manage payments" on public.payments for all to authenticated using (true);

create policy "Authenticated users can read audit_logs" on public.audit_logs for select to authenticated using (true);
create policy "Authenticated users can manage audit_logs" on public.audit_logs for all to authenticated using (true);

-- SEED: Default categories
insert into public.categories (name, color) values
('Beverages', '#3b82f6'),
('Food', '#10b981'),
('Snacks', '#f97316'),
('Dairy', '#f43f5e'),
('Bakery', '#a855f7');
