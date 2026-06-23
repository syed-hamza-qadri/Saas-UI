insert into public.settings (key, value) values
  ('require_pin_void', 'true'),
  ('auto_cut', 'true'),
  ('print_logo', 'false'),
  ('alert_email', ''),
  ('session_timeout', '30'),
  ('tax_rate', '17'),
  ('max_cashier_discount', '10'),
  ('store_name', 'My POS Store'),
  ('store_address', 'Karachi, Pakistan'),
  ('store_phone', '+92 300 0000000'),
  ('currency', 'PKR'),
  ('gst_number', ''),
  ('receipt_footer', 'Thank you for your purchase!'),
  ('printer_name', 'EPSON TM-T20III'),
  ('paper_width', '80mm')
on conflict (key) do nothing;
