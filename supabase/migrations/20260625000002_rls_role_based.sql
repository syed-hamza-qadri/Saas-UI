-- Helper function to get current user's role
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select role from public.users where auth_id = auth.uid();
$$;

-- SETTINGS: only admins can write
drop policy if exists "Authenticated users can manage settings" on public.settings;
create policy "Anyone can read settings" on public.settings
  for select to authenticated using (true);
create policy "Admins can write settings" on public.settings
  for insert to authenticated with check (public.get_my_role() = 'admin');
create policy "Admins can update settings" on public.settings
  for update to authenticated using (public.get_my_role() = 'admin');
create policy "Admins can delete settings" on public.settings
  for delete to authenticated using (public.get_my_role() = 'admin');

-- ORDERS: anyone can insert, only admins/managers can update status
drop policy if exists "Authenticated users can manage orders" on public.orders;
create policy "Anyone can read orders" on public.orders
  for select to authenticated using (true);
create policy "Authenticated can insert orders" on public.orders
  for insert to authenticated with check (true);
create policy "Admins and managers can update orders" on public.orders
  for update to authenticated using (public.get_my_role() in ('admin', 'manager'));
create policy "Admins can delete orders" on public.orders
  for delete to authenticated using (public.get_my_role() = 'admin');

-- USERS: users can only read their own record; admins read all
drop policy if exists "Authenticated users can read users" on public.users;
drop policy if exists "Authenticated users can manage users" on public.users;
create policy "Users read own record" on public.users
  for select to authenticated using (auth_id = auth.uid());
create policy "Admins read all users" on public.users
  for select to authenticated using (public.get_my_role() = 'admin');
create policy "Admins manage users" on public.users
  for all to authenticated using (public.get_my_role() = 'admin');

-- AUDIT LOGS: anyone can insert, only admins can read
drop policy if exists "Authenticated users can read audit_logs" on public.audit_logs;
drop policy if exists "Authenticated users can manage audit_logs" on public.audit_logs;
create policy "Authenticated can insert audit_logs" on public.audit_logs
  for insert to authenticated with check (true);
create policy "Admins can read audit_logs" on public.audit_logs
  for select to authenticated using (public.get_my_role() = 'admin');

-- PRODUCTS: anyone can read active products, only admins/managers can write
drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Anyone can read products" on public.products
  for select to authenticated using (true);
create policy "Admins and managers can manage products" on public.products
  for all to authenticated using (public.get_my_role() in ('admin', 'manager'));

-- CATEGORIES: anyone read, admins write
drop policy if exists "Authenticated users can manage categories" on public.categories;
create policy "Anyone can read categories" on public.categories
  for select to authenticated using (true);
create policy "Admins can manage categories" on public.categories
  for all to authenticated using (public.get_my_role() = 'admin');
