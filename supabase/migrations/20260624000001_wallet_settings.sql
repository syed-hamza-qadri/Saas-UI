insert into public.settings (key, value) values
  ('wallet_name', ''),
  ('wallet_number', '')
on conflict (key) do nothing;
