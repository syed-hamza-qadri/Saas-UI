create or replace function public.reduce_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock_qty = greatest(0, stock_qty - p_quantity)
  where id = p_product_id;
end;
$$;
