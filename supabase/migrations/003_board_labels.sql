-- ============================================================
-- 003: Tabla board_labels para etiquetas de filas y columnas
-- Cada tablero tiene hasta 5 etiquetas de columna (arriba)
-- y 5 etiquetas de fila (derecha), como en el cartón físico.
-- ============================================================

CREATE TABLE public.board_labels (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  board_number int         NOT NULL REFERENCES public.board_templates(board_number) ON DELETE CASCADE,
  tipo         text        NOT NULL CHECK (tipo IN ('columna', 'fila')),
  posicion     int         NOT NULL CHECK (posicion BETWEEN 1 AND 5),
  texto        text        NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (board_number, tipo, posicion)
);

ALTER TABLE public.board_labels ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer las etiquetas
CREATE POLICY "board_labels_select" ON public.board_labels
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo admins pueden insertar, actualizar o eliminar
CREATE POLICY "board_labels_admin_insert" ON public.board_labels
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "board_labels_admin_update" ON public.board_labels
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "board_labels_admin_delete" ON public.board_labels
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );
