-- ============================================
-- FINAL RLS AND FUNCTIONS FIX
-- Consolidates all manual fixes applied post-deployment
-- ============================================

-- ============================================
-- 1. HELPER FUNCTION
-- ============================================
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where auth_id = auth.uid();
$$;

grant execute on function public.get_my_role() to authenticated;

-- ============================================
-- 2. ATOMIC ORDER CREATION (FINAL VERSION)
-- ============================================
create or replace function public.create_order_atomic(
  p_order jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  item jsonb;
  v_stock integer;
begin
  v_order_number := 'ORD-' || lpad(nextval('public.order_number_seq')::text, 6, '0');

  insert into public.orders (
    order_number, customer_id, subtotal, tax, discount, total,
    status, payment_method, notes
  )
  values (
    v_order_number,
    nullif(p_order->>'customer_id', '')::uuid,
    (p_order->>'subtotal')::numeric,
    (p_order->>'tax')::numeric,
    (p_order->>'discount')::numeric,
    (p_order->>'total')::numeric,
    coalesce(p_order->>'status', 'completed'),
    p_order->>'payment_method',
    p_order->>'notes'
  )
  returning id into v_order_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    select stock_qty into v_stock
    from public.products
    where id = (item->>'product_id')::uuid;

    if v_stock is null then
      raise exception 'Product not found: %', item->>'product_name';
    end if;

    if v_stock < (item->>'quantity')::integer then
      raise exception 'Insufficient stock for: %. Available: %, Requested: %',
        item->>'product_name', v_stock, item->>'quantity';
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, quantity, unit_price, discount, subtotal
    )
    values (
      v_order_id,
      (item->>'product_id')::uuid,
      item->>'product_name',
      (item->>'quantity')::integer,
      (item->>'unit_price')::numeric,
      (item->>'discount')::numeric,
      (item->>'subtotal')::numeric
    );

    update public.products
    set stock_qty = stock_qty - (item->>'quantity')::integer
    where id = (item->>'product_id')::uuid;
  end loop;

  if (p_order->>'customer_id') is not null and (p_order->>'customer_id') != '' then
    update public.customers
    set
      total_spent = total_spent + (p_order->>'total')::numeric,
      loyalty_points = loyalty_points + floor((p_order->>'total')::numeric / 100)::integer
    where id = nullif(p_order->>'customer_id', '')::uuid;
  end if;

  return v_order_id;
end;
$$;

grant execute on function public.create_order_atomic(jsonb, jsonb) to authenticated;

-- ============================================
-- 3. VOID ORDER ATOMIC (FINAL VERSION)
-- ============================================
create or replace function public.void_order_atomic(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products p
  set stock_qty = p.stock_qty + oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id
  and oi.product_id = p.id;

  update public.orders
  set status = p_status
  where id = p_order_id;

  update public.customers c
  set
    total_spent = greatest(0, c.total_spent - o.total),
    loyalty_points = greatest(0, c.loyalty_points - floor(o.total / 100)::integer)
  from public.orders o
  where o.id = p_order_id
  and c.id = o.customer_id;
end;
$$;

grant execute on function public.void_order_atomic(uuid, text) to authenticated;

-- ============================================
-- 4. RLS POLICIES — PRODUCTS
-- ============================================
drop policy if exists "Authenticated users can manage products" on public.products;
drop policy if exists "Admins and managers can manage products" on public.products;
drop policy if exists "Anyone can read products" on public.products;
drop policy if exists "Authenticated users can read products" on public.products;
drop policy if exists "Admins and managers can insert products" on public.products;
drop policy if exists "Admins and managers can update products" on public.products;
drop policy if exists "Admins and managers can delete products" on public.products;

create policy "Anyone can read products" on public.products
  for select to authenticated using (true);
create policy "Admins and managers can insert products" on public.products
  for insert to authenticated with check (public.get_my_role() in ('admin', 'manager'));
create policy "Anyone can update products" on public.products
  for update to authenticated using (true);
create policy "Admins and managers can delete products" on public.products
  for delete to authenticated using (public.get_my_role() in ('admin', 'manager'));

-- ============================================
-- 5. RLS POLICIES — ORDER ITEMS
-- ============================================
drop policy if exists "Authenticated users can read order_items" on public.order_items;
drop policy if exists "Authenticated users can manage order_items" on public.order_items;
drop policy if exists "Anyone can read order_items" on public.order_items;
drop policy if exists "Anyone can insert order_items" on public.order_items;
drop policy if exists "Admins can update order_items" on public.order_items;
drop policy if exists "Admins can delete order_items" on public.order_items;

create policy "Anyone can read order_items" on public.order_items
  for select to authenticated using (true);
create policy "Anyone can insert order_items" on public.order_items
  for insert to authenticated with check (true);
create policy "Admins can update order_items" on public.order_items
  for update to authenticated using (public.get_my_role() in ('admin', 'manager'));
create policy "Admins can delete order_items" on public.order_items
  for delete to authenticated using (public.get_my_role() = 'admin');

-- ============================================
-- 6. RLS POLICIES — PAYMENTS
-- ============================================
drop policy if exists "Authenticated users can read payments" on public.payments;
drop policy if exists "Authenticated users can manage payments" on public.payments;
drop policy if exists "Anyone can read payments" on public.payments;
drop policy if exists "Anyone can insert payments" on public.payments;

create policy "Anyone can read payments" on public.payments
  for select to authenticated using (true);
create policy "Anyone can insert payments" on public.payments
  for insert to authenticated with check (true);

-- ============================================
-- 7. RLS POLICIES — CUSTOMERS
-- ============================================
drop policy if exists "Authenticated users can read customers" on public.customers;
drop policy if exists "Authenticated users can manage customers" on public.customers;
drop policy if exists "Anyone can read customers" on public.customers;
drop policy if exists "Anyone can insert customers" on public.customers;
drop policy if exists "Anyone can update customers" on public.customers;
drop policy if exists "Admins can delete customers" on public.customers;

create policy "Anyone can read customers" on public.customers
  for select to authenticated using (true);
create policy "Anyone can insert customers" on public.customers
  for insert to authenticated with check (true);
create policy "Anyone can update customers" on public.customers
  for update to authenticated using (true);
create policy "Admins can delete customers" on public.customers
  for delete to authenticated using (public.get_my_role() in ('admin', 'manager'));

-- ============================================
-- 8. RLS POLICIES — USERS
-- ============================================
drop policy if exists "Authenticated users can read users" on public.users;
drop policy if exists "Authenticated users can manage users" on public.users;
drop policy if exists "Users read own record" on public.users;
drop policy if exists "Admins read all users" on public.users;
drop policy if exists "Admins manage users" on public.users;
drop policy if exists "Users can read own record" on public.users;
drop policy if exists "Admins can manage users" on public.users;
drop policy if exists "Users insert own record" on public.users;
drop policy if exists "Admins update users" on public.users;
drop policy if exists "Admins delete users" on public.users;

create policy "Users read own record" on public.users
  for select to authenticated
  using (auth_id = auth.uid());
create policy "Admins read all users" on public.users
  for select to authenticated
  using (
    exists (
      select 1 from public.users
      where auth_id = auth.uid() and role = 'admin'
    )
  );
create policy "Admins manage users" on public.users
  for all to authenticated
  using (
    exists (
      select 1 from public.users
      where auth_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- 9. RLS POLICIES — SETTINGS
-- ============================================
drop policy if exists "Authenticated users can manage settings" on public.settings;
drop policy if exists "Anyone can read settings" on public.settings;
drop policy if exists "Admins can write settings" on public.settings;
drop policy if exists "Admins can update settings" on public.settings;
drop policy if exists "Admins can delete settings" on public.settings;

create policy "Anyone can read settings" on public.settings
  for select to authenticated using (true);
create policy "Admins can insert settings" on public.settings
  for insert to authenticated with check (public.get_my_role() = 'admin');
create policy "Admins can update settings" on public.settings
  for update to authenticated using (public.get_my_role() = 'admin');
create policy "Admins can delete settings" on public.settings
  for delete to authenticated using (public.get_my_role() = 'admin');

-- ============================================
-- 10. RLS POLICIES — ORDERS
-- ============================================
drop policy if exists "Authenticated users can manage orders" on public.orders;
drop policy if exists "Authenticated users can read orders" on public.orders;
drop policy if exists "Anyone can read orders" on public.orders;
drop policy if exists "Authenticated can insert orders" on public.orders;
drop policy if exists "Admins and managers can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Anyone can read orders" on public.orders
  for select to authenticated using (true);
create policy "Anyone can insert orders" on public.orders
  for insert to authenticated with check (true);
create policy "Admins and managers can update orders" on public.orders
  for update to authenticated
  using (public.get_my_role() in ('admin', 'manager'));
create policy "Admins can delete orders" on public.orders
  for delete to authenticated
  using (public.get_my_role() = 'admin');

-- ============================================
-- 11. RLS POLICIES — CATEGORIES
-- ============================================
drop policy if exists "Authenticated users can manage categories" on public.categories;
drop policy if exists "Authenticated users can read categories" on public.categories;
drop policy if exists "Anyone can read categories" on public.categories;
drop policy if exists "Admins can manage categories" on public.categories;

create policy "Anyone can read categories" on public.categories
  for select to authenticated using (true);
create policy "Admins can manage categories" on public.categories
  for all to authenticated
  using (public.get_my_role() = 'admin');

-- ============================================
-- 12. AUDIT LOGS
-- ============================================
drop policy if exists "Authenticated users can read audit_logs" on public.audit_logs;
drop policy if exists "Authenticated users can manage audit_logs" on public.audit_logs;
drop policy if exists "Authenticated can insert audit_logs" on public.audit_logs;
drop policy if exists "Admins can read audit_logs" on public.audit_logs;

create policy "Authenticated can insert audit_logs" on public.audit_logs
  for insert to authenticated with check (true);
create policy "Admins can read audit_logs" on public.audit_logs
  for select to authenticated
  using (public.get_my_role() = 'admin');
