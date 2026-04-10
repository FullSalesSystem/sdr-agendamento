-- migration_004: config effective date + prev hours snapshot
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS effective_from DATE,
  ADD COLUMN IF NOT EXISTS prev_horarios_h1 TEXT[],
  ADD COLUMN IF NOT EXISTS prev_horarios_h2 TEXT[],
  ADD COLUMN IF NOT EXISTS prev_horarios_h1_sab TEXT[],
  ADD COLUMN IF NOT EXISTS prev_horarios_h2_sab TEXT[];
