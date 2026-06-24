create or replace function public.reduce_stock_batch(
  p_items jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    update public.products
    set stock_qty = greatest(0, stock_qty - (item->>'quantity')::integer)
    where id = (item->>'product_id')::uuid;
  end loop;
end;
$$;
