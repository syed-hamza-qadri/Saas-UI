-- Order number sequence
create sequence if not exists public.order_number_seq start 1000;

-- Atomic order creation function
create or replace function public.create_order_atomic(
  p_order jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_order_number text;
  item jsonb;
  v_stock integer;
begin
  -- Generate unique order number from sequence
  v_order_number := 'ORD-' || lpad(nextval('public.order_number_seq')::text, 6, '0');

  -- Insert order
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

  -- Process each item with row-level lock
  for item in select * from jsonb_array_elements(p_items)
  loop
    -- Lock the product row
    select stock_qty into v_stock
    from public.products
    where id = (item->>'product_id')::uuid
    for update;

    -- Check stock sufficiency
    if v_stock is null then
      raise exception 'Product not found: %', item->>'product_name';
    end if;

    if v_stock < (item->>'quantity')::integer then
      raise exception 'Insufficient stock for: %. Available: %, Requested: %',
        item->>'product_name', v_stock, item->>'quantity';
    end if;

    -- Insert order item
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

    -- Reduce stock
    update public.products
    set stock_qty = stock_qty - (item->>'quantity')::integer
    where id = (item->>'product_id')::uuid;
  end loop;

  -- Update customer loyalty points and total spent
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

-- Atomic void/refund function
create or replace function public.void_order_atomic(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Restore stock first
  update public.products p
  set stock_qty = p.stock_qty + oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id
  and oi.product_id = p.id;

  -- Update order status
  update public.orders
  set status = p_status
  where id = p_order_id;

  -- Reverse customer loyalty if customer exists
  update public.customers c
  set
    total_spent = greatest(0, c.total_spent - o.total),
    loyalty_points = greatest(0, c.loyalty_points - floor(o.total / 100)::integer)
  from public.orders o
  where o.id = p_order_id
  and c.id = o.customer_id;
end;
$$;
