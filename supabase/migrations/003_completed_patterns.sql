-- Rastrear qué patrones ya fueron ganados en la ronda actual
-- (el juego continúa hasta que se ganen TODOS los patrones seleccionados)
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS completed_patterns jsonb DEFAULT '[]'::jsonb;
