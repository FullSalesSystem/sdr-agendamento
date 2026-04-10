-- Remove foreign key constraints that reference auth.users
-- since the app runs without authentication (shared user ID)

-- Settings table
ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;

-- Agendamentos table
ALTER TABLE public.agendamentos DROP CONSTRAINT IF EXISTS agendamentos_user_id_fkey;
