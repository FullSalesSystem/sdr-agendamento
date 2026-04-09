-- Prevent double-booking: same user, date, time, closer
create unique index if not exists idx_agendamentos_unique_slot
  on public.agendamentos(user_id, date, horario, closer)
  where cancelado = false and closer != '';
