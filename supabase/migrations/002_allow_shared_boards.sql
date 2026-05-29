-- Permite que más de un jugador use el mismo tablero en una sala
-- Esto habilita partidas con más de 12 jugadores (hasta max_boards configurado)

-- Eliminar la restricción UNIQUE que impedía compartir tableros
ALTER TABLE public.room_slots
  DROP CONSTRAINT IF EXISTS room_slots_room_id_board_template_id_key;

-- Agregar índice simple (sin unicidad) para mantener rendimiento
CREATE INDEX IF NOT EXISTS idx_room_slots_room_board
  ON public.room_slots(room_id, board_template_id);
