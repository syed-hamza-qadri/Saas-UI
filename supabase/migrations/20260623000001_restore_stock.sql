create or replace function public.restore_stock(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.products p
  set stock_qty = p.stock_qty + oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id
  and oi.product_id = p.id;
end;
$$;
