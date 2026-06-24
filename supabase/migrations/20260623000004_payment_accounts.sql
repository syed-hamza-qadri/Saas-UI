insert into public.settings (key, value) values
  ('card_account_number', ''),
  ('bank_transfer_account_number', '')
on conflict (key) do nothing;
