create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "Authenticated users can manage settings"
  on public.settings for all to authenticated using (true);

insert into public.settings (key, value) values
  ('store_name', 'My POS Store'),
  ('store_address', 'Karachi, Pakistan'),
  ('store_phone', '+92 300 0000000'),
  ('currency', 'PKR'),
  ('gst_number', ''),
  ('tax_rate', '17'),
  ('max_cashier_discount', '10'),
  ('session_timeout', '30'),
  ('receipt_footer', 'Thank you for your purchase!'),
  ('auto_print_receipt', 'true'),
  ('email_receipt', 'false'),
  ('show_gst_on_receipt', 'true'),
  ('cash_payment', 'true'),
  ('card_payment', 'true'),
  ('bank_transfer', 'true'),
  ('two_factor', 'false'),
  ('low_stock_alert', 'true'),
  ('daily_summary', 'true'),
  ('order_notification', 'false'),
  ('printer_name', 'EPSON TM-T20III'),
  ('paper_width', '80mm'),
  ('auto_cut', 'true'),
  ('print_logo', 'false')
on conflict (key) do nothing;
