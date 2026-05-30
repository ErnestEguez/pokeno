-- Tabla para persistir los ganadores de cada ronda
CREATE TABLE IF NOT EXISTS public.room_wins (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      UUID         NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  pattern      TEXT         NOT NULL,
  winner_label TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Cualquier usuario autenticado puede leer los ganadores de la sala
ALTER TABLE public.room_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_wins_select"
  ON public.room_wins FOR SELECT
  TO authenticated
  USING (true);
