-- Migration: add dynamic hours columns to settings
alter table public.settings
  add column if not exists horarios_h1 text[] default array['10','13','15','17','19'],
  add column if not exists horarios_h2 text[] default array['11','14','16','18'],
  add column if not exists horarios_h1_sab text[] default array['10','13'],
  add column if not exists horarios_h2_sab text[] default array['11','14'];

-- Update existing rows with defaults
update public.settings set
  horarios_h1 = array['10','13','15','17','19'],
  horarios_h2 = array['11','14','16','18'],
  horarios_h1_sab = array['10','13'],
  horarios_h2_sab = array['11','14']
where horarios_h1 is null;
