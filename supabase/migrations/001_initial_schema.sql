-- ============================================================
-- 001_initial_schema.sql
-- Schema inicial de la aplicación Pokeno
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: users (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE public.users (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text,
  display_name  text,
  is_admin      boolean     DEFAULT false,
  is_enabled    boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- TABLA: subscriptions
-- ============================================================
CREATE TABLE public.subscriptions (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid    UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  games_total         int     DEFAULT 0,
  games_used          int     DEFAULT 0,
  max_boards_per_game int     DEFAULT 12,
  is_active           boolean DEFAULT true,
  updated_at          timestamptz DEFAULT now()
);

-- ============================================================
-- TABLA: board_templates
-- ============================================================
CREATE TABLE public.board_templates (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  board_number int     UNIQUE,
  display_name text,
  card_grid    jsonb,
  created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- TABLA: rooms
-- ============================================================
CREATE TABLE public.rooms (
  id               uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid   REFERENCES public.users(id),
  host_id          uuid   REFERENCES public.users(id),
  name             text,
  status           text   DEFAULT 'lobby'
                          CHECK (status IN ('lobby','playing','paused','finished')),
  winning_patterns jsonb,
  max_boards       int    DEFAULT 12,
  invite_code      text   UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at       timestamptz DEFAULT now(),
  ended_at         timestamptz
);

-- ============================================================
-- TABLA: room_slots
-- ============================================================
CREATE TABLE public.room_slots (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  board_template_id uuid REFERENCES public.board_templates(id),
  slot_label        text,
  position          int,
  claimed_at        timestamptz DEFAULT now(),
  UNIQUE(room_id, board_template_id)
);

-- ============================================================
-- TABLA: room_decks
-- ============================================================
CREATE TABLE public.room_decks (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid    UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,
  shuffled_deck jsonb,
  current_index int     DEFAULT 0,
  deck_status   text    DEFAULT 'ready'
                        CHECK (deck_status IN ('ready','running','paused','done')),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================================
-- TABLA: called_cards
-- ============================================================
CREATE TABLE public.called_cards (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  card_code  text,
  call_order int,
  called_at  timestamptz DEFAULT now()
);

-- ============================================================
-- TABLA: marked_cells
-- ============================================================
CREATE TABLE public.marked_cells (
  id        uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id   uuid    REFERENCES public.room_slots(id) ON DELETE CASCADE,
  card_code text,
  is_marked boolean DEFAULT true,
  UNIQUE(slot_id, card_code)
);

-- ============================================================
-- TABLA: host_log
-- ============================================================
CREATE TABLE public.host_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES public.users(id),
  action      text,
  occurred_at timestamptz DEFAULT now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_called_cards_room_order ON public.called_cards(room_id, call_order);
CREATE INDEX idx_marked_cells_slot       ON public.marked_cells(slot_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_decks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.called_cards  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marked_cells  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_log      ENABLE ROW LEVEL SECURITY;

-- Función helper: verifica si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- ============================================================
-- POLICIES: users
-- ============================================================
CREATE POLICY "users_select"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users_insert"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update"
  ON public.users FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

-- ============================================================
-- POLICIES: subscriptions
-- ============================================================
CREATE POLICY "subscriptions_select"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "subscriptions_insert"
  ON public.subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "subscriptions_update"
  ON public.subscriptions FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- POLICIES: board_templates (lectura para todos los autenticados)
-- ============================================================
CREATE POLICY "board_templates_select"
  ON public.board_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "board_templates_all_admin"
  ON public.board_templates FOR ALL
  USING (public.is_admin());

-- ============================================================
-- POLICIES: rooms
-- ============================================================
CREATE POLICY "rooms_select"
  ON public.rooms FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "rooms_insert"
  ON public.rooms FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "rooms_update"
  ON public.rooms FOR UPDATE
  USING (host_id = auth.uid() OR owner_id = auth.uid() OR public.is_admin());

-- ============================================================
-- POLICIES: room_slots
-- ============================================================
CREATE POLICY "room_slots_select"
  ON public.room_slots FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "room_slots_insert"
  ON public.room_slots FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "room_slots_update"
  ON public.room_slots FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "room_slots_delete"
  ON public.room_slots FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- POLICIES: room_decks
-- ============================================================
CREATE POLICY "room_decks_select"
  ON public.room_decks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "room_decks_insert"
  ON public.room_decks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "room_decks_update"
  ON public.room_decks FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- POLICIES: called_cards
-- ============================================================
CREATE POLICY "called_cards_select"
  ON public.called_cards FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "called_cards_insert"
  ON public.called_cards FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- POLICIES: marked_cells
-- ============================================================
CREATE POLICY "marked_cells_select"
  ON public.marked_cells FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "marked_cells_insert"
  ON public.marked_cells FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "marked_cells_update"
  ON public.marked_cells FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- POLICIES: host_log
-- ============================================================
CREATE POLICY "host_log_select"
  ON public.host_log FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "host_log_insert"
  ON public.host_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- TRIGGER: crea fila en public.users y subscription al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED: 12 board_templates con grids de cartas de Pokeno
-- Cada tablero es una matriz 5x5 (25 cartas únicas por tablero).
-- Las cartas pueden repetirse entre tableros distintos,
-- igual que en el juego físico.
-- ============================================================
INSERT INTO public.board_templates (board_number, display_name, card_grid) VALUES

(1, 'Tablero 1', '[
  ["A♠","2♥","3♦","4♣","5♠"],
  ["6♥","7♦","8♣","9♠","10♥"],
  ["J♦","Q♣","K♠","A♥","2♦"],
  ["3♣","4♠","5♥","6♦","7♣"],
  ["8♠","9♥","10♦","J♣","Q♠"]
]'::jsonb),

(2, 'Tablero 2', '[
  ["K♥","A♦","2♣","3♠","4♥"],
  ["5♦","6♣","7♠","8♥","9♦"],
  ["10♣","J♠","Q♥","K♦","A♣"],
  ["2♠","3♥","4♦","5♣","6♠"],
  ["7♥","8♦","9♣","10♠","J♥"]
]'::jsonb),

(3, 'Tablero 3', '[
  ["Q♦","K♣","A♠","2♥","3♦"],
  ["4♣","5♠","6♥","7♦","8♣"],
  ["9♠","10♥","J♦","Q♣","K♠"],
  ["A♥","2♦","3♣","4♠","5♥"],
  ["6♦","7♣","8♠","9♥","10♦"]
]'::jsonb),

(4, 'Tablero 4', '[
  ["J♣","Q♠","K♥","A♦","2♣"],
  ["3♠","4♥","5♦","6♣","7♠"],
  ["8♥","9♦","10♣","J♠","Q♥"],
  ["K♦","A♣","2♠","3♥","4♦"],
  ["5♣","6♠","7♥","8♦","9♣"]
]'::jsonb),

(5, 'Tablero 5', '[
  ["10♠","J♥","Q♦","K♣","A♠"],
  ["2♥","3♦","4♣","5♠","6♥"],
  ["7♦","8♣","9♠","10♥","J♦"],
  ["Q♣","K♠","A♥","2♦","3♣"],
  ["4♠","5♥","6♦","7♣","8♠"]
]'::jsonb),

(6, 'Tablero 6', '[
  ["9♥","10♦","J♣","Q♠","K♥"],
  ["A♦","2♣","3♠","4♥","5♦"],
  ["6♣","7♠","8♥","9♦","10♣"],
  ["J♠","Q♥","K♦","A♣","2♠"],
  ["3♥","4♦","5♣","6♠","7♥"]
]'::jsonb),

(7, 'Tablero 7', '[
  ["8♦","9♣","10♠","J♥","Q♦"],
  ["K♣","A♠","2♥","3♦","4♣"],
  ["5♠","6♥","7♦","8♣","9♠"],
  ["10♥","J♦","Q♣","K♠","A♥"],
  ["2♦","3♣","4♠","5♥","6♦"]
]'::jsonb),

(8, 'Tablero 8', '[
  ["7♣","8♠","9♥","10♦","J♣"],
  ["Q♠","K♥","A♦","2♣","3♠"],
  ["4♥","5♦","6♣","7♠","8♥"],
  ["9♦","10♣","J♠","Q♥","K♦"],
  ["A♣","2♠","3♥","4♦","5♣"]
]'::jsonb),

(9, 'Tablero 9', '[
  ["6♠","7♥","8♦","9♣","10♠"],
  ["J♥","Q♦","K♣","A♠","2♥"],
  ["3♦","4♣","5♠","6♥","7♦"],
  ["8♣","9♠","10♥","J♦","Q♣"],
  ["K♠","A♥","2♦","3♣","4♠"]
]'::jsonb),

(10, 'Tablero 10', '[
  ["5♥","6♦","7♣","8♠","9♥"],
  ["10♦","J♣","Q♠","K♥","A♦"],
  ["2♣","3♠","4♥","5♦","6♣"],
  ["7♠","8♥","9♦","10♣","J♠"],
  ["Q♥","K♦","A♣","2♠","3♥"]
]'::jsonb),

(11, 'Tablero 11', '[
  ["4♦","5♣","6♠","7♥","8♦"],
  ["9♣","10♠","J♥","Q♦","K♣"],
  ["A♠","2♥","3♦","4♣","5♠"],
  ["6♥","7♦","8♣","9♠","10♥"],
  ["J♦","Q♣","K♠","A♥","2♦"]
]'::jsonb),

(12, 'Tablero 12', '[
  ["3♣","4♠","5♥","6♦","7♣"],
  ["8♠","9♥","10♦","J♣","Q♠"],
  ["K♥","A♦","2♣","3♠","4♥"],
  ["5♦","6♣","7♠","8♥","9♦"],
  ["10♣","J♠","Q♥","K♦","A♣"]
]'::jsonb);
