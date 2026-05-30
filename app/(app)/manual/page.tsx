import Link from 'next/link'

// ── Componentes visuales internos ──────────────────────────────────────────

function MiniCard({ value, suit, highlighted = false, faded = false }: {
  value: string; suit: string; highlighted?: boolean; faded?: boolean
}) {
  const isRed = suit === '♥' || suit === '♦'
  return (
    <div style={{
      width: 44, height: 60,
      background: highlighted ? (isRed ? '#fff1f2' : '#f0fdf4') : faded ? '#f9fafb' : '#ffffff',
      border: `2px solid ${highlighted ? (isRed ? '#f87171' : '#34d399') : '#d1d5db'}`,
      borderRadius: 6,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 2px',
      boxShadow: highlighted ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.08)',
      position: 'relative',
      flexShrink: 0,
      opacity: faded ? 0.45 : 1,
    }}>
      <span style={{
        fontSize: 12, fontWeight: 900, lineHeight: 1,
        color: isRed ? '#dc2626' : '#111827',
        fontFamily: 'sans-serif',
      }}>{value}</span>
      <span style={{ fontSize: 16, lineHeight: 1, color: isRed ? '#dc2626' : '#111827' }}>{suit}</span>
      <span style={{
        fontSize: 12, fontWeight: 900, lineHeight: 1,
        color: isRed ? '#dc2626' : '#111827',
        transform: 'rotate(180deg)',
        fontFamily: 'sans-serif',
      }}>{value}</span>
      {highlighted && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 5,
          background: isRed ? 'rgba(254,202,202,0.25)' : 'rgba(167,243,208,0.25)',
        }} />
      )}
    </div>
  )
}

function CardRow({ cards }: { cards: { value: string; suit: string; highlighted?: boolean; faded?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {cards.map((c, i) => (
        <MiniCard key={i} value={c.value} suit={c.suit} highlighted={c.highlighted} faded={c.faded} />
      ))}
    </div>
  )
}

function MiniBoard({ grid, highlighted }: {
  grid: [string, string][][]
  highlighted: number[][]
}) {
  const isHighlighted = (r: number, c: number) => highlighted.some(([hr, hc]) => hr === r && hc === c)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 44px)', gap: 4 }}>
      {grid.map((row, r) =>
        row.map(([value, suit], c) => (
          <MiniCard key={`${r}-${c}`} value={value} suit={suit} highlighted={isHighlighted(r, c)} faded={!isHighlighted(r, c)} />
        ))
      )}
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function WinBox({ title, badge, badgeColor, description, example }: {
  title: string; badge: string; badgeColor: string; description: string; example: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 flex items-center gap-3 ${badgeColor}`}>
        <span className="font-black text-lg tracking-wide">{title}</span>
        <span className="text-sm font-semibold opacity-80">{badge}</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-sm text-gray-600">{description}</p>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">EJEMPLO</p>
          {example}
        </div>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function ManualPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-12">

      {/* Portada */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center shadow-lg">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-3xl font-black mb-2">Manual del Jugador</h1>
        <p className="text-blue-100 text-lg">Pokeno — El juego de cartas familiar</p>
      </div>

      {/* Índice */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-700 mb-3">Contenido</h2>
        <ol className="space-y-1 text-sm text-blue-600">
          {[
            ['¿Qué es Pókeno?', '#que-es'],
            ['El tablero', '#tablero'],
            ['Las cartas', '#cartas'],
            ['Cómo se juega', '#como-jugar'],
            ['Combinaciones ganadoras', '#combinaciones'],
            ['Roles: Jugador y Anfitrión', '#roles'],
            ['Consejos para ganar', '#consejos'],
          ].map(([label, href]) => (
            <li key={href}>
              <a href={href} className="hover:underline">{label}</a>
            </li>
          ))}
        </ol>
      </div>

      {/* ── 1. ¿Qué es Pókeno? ───────────────────────────────────────── */}
      <Section id="que-es" title="1. ¿Qué es Pókeno?">
        <p className="text-gray-600">
          Pókeno es un juego de mesa familiar que combina la emoción del <strong>Bingo</strong> con las
          combinaciones del <strong>Póker</strong>. En lugar de números, se usan cartas de una baraja
          estándar de 52 cartas. El objetivo es marcar cartas en tu tablero 5×5 formando combinaciones
          ganadoras antes que los demás jugadores.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>Ideal para:</strong> 2 o más jugadores · Todas las edades · Partidas de 10 a 30 minutos
        </div>
      </Section>

      {/* ── 2. El tablero ─────────────────────────────────────────────── */}
      <Section id="tablero" title="2. El tablero">
        <p className="text-gray-600">
          Cada jugador tiene un tablero personal de <strong>5 columnas × 5 filas</strong> (25 cartas en
          total). Todas las cartas del tablero son únicas — no se repiten dentro del mismo tablero.
        </p>

        {/* Ilustración del tablero */}
        <div className="bg-gray-50 rounded-xl p-5 overflow-x-auto">
          <div className="flex gap-2 w-fit mx-auto">
            {/* Grid */}
            <div>
              {/* Etiquetas de columna */}
              <div className="flex gap-1 mb-1">
                {['ESCALERA SIMPLE','ESCALERA REAL','FILA COLOR','—','—'].map((lbl, i) => (
                  <div key={i} style={{ width: 44 }}
                    className="text-center text-xs font-bold text-blue-700 bg-blue-100 rounded px-0.5 py-1 leading-tight">
                    {lbl}
                  </div>
                ))}
              </div>
              {/* Filas */}
              {[
                { label: 'POKER',    cards: [['Q','♥'],['Q','♣'],['Q','♠'],['Q','♦'],['4','♥']] },
                { label: 'FULL',     cards: [['J','♣'],['J','♥'],['J','♠'],['2','♦'],['2','♥']] },
                { label: 'TRÍO',     cards: [['8','♥'],['9','♥'],['8','♠'],['8','♦'],['3','♥']] },
                { label: '2 PARES',  cards: [['10','♣'],['K','♠'],['10','♠'],['5','♦'],['5','♥']] },
                { label: '1 PAR',    cards: [['9','♣'],['10','♥'],['9','♠'],['3','♦'],['K','♥']] },
              ].map((row, r) => (
                <div key={r} className="flex items-center gap-1 mb-1">
                  <div className="flex gap-1">
                    {row.cards.map(([v, s], c) => (
                      <MiniCard key={c} value={v} suit={s} />
                    ))}
                  </div>
                  <div className="ml-1 text-xs font-bold text-green-800 bg-green-100 border border-green-200 rounded px-1.5 py-0.5 w-20 text-center">
                    {row.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Tablero de muestra — las etiquetas indican la combinación ganadora de cada fila/columna
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="font-bold text-blue-800 mb-1">Etiquetas de columna (arriba)</p>
            <p className="text-blue-700">Indican qué combinación se puede armar completando esa columna de 5 cartas de arriba a abajo.</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="font-bold text-green-800 mb-1">Etiquetas de fila (derecha)</p>
            <p className="text-green-700">Indican qué combinación se puede armar completando esa fila de 5 cartas de izquierda a derecha.</p>
          </div>
        </div>
      </Section>

      {/* ── 3. Las cartas ─────────────────────────────────────────────── */}
      <Section id="cartas" title="3. Las cartas">
        <p className="text-gray-600">
          Se usa una baraja estándar de <strong>52 cartas</strong>, dividida en 4 palos y 13 valores.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { suit: '♠', name: 'Picas', color: 'gray' },
            { suit: '♣', name: 'Tréboles', color: 'gray' },
            { suit: '♥', name: 'Corazones', color: 'red' },
            { suit: '♦', name: 'Diamantes', color: 'red' },
          ].map(p => (
            <div key={p.suit}
              className={`rounded-xl border p-4 text-center ${p.color === 'red' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div style={{ fontSize: 36, color: p.color === 'red' ? '#dc2626' : '#111827' }}>{p.suit}</div>
              <p className={`font-bold text-sm mt-1 ${p.color === 'red' ? 'text-red-700' : 'text-gray-700'}`}>{p.name}</p>
              <p className={`text-xs mt-0.5 ${p.color === 'red' ? 'text-red-400' : 'text-gray-400'}`}>
                {p.color === 'red' ? 'Rojas' : 'Negras'}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">13 valores por palo:</p>
          <div className="flex flex-wrap gap-2">
            {['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map((v, i) => (
              <span key={v} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm">
                {v}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            A = As · J = Jota · Q = Reina · K = Rey · El As vale 1 (bajo) o 14 (alto) en escaleras
          </p>
        </div>
      </Section>

      {/* ── 4. Cómo se juega ──────────────────────────────────────────── */}
      <Section id="como-jugar" title="4. Cómo se juega">
        <div className="space-y-3">
          {[
            {
              step: '1',
              icon: '🏠',
              title: 'Únete a una sala',
              desc: 'El administrador te dará un código de sala de 6 caracteres. En la pantalla de lobby, presiona "+ Unirse con código" e ingresa el código.',
            },
            {
              step: '2',
              icon: '🃏',
              title: 'Selecciona tu tablero',
              desc: 'Antes de que empiece la partida, elige uno de los tableros disponibles. Cada tablero tiene cartas únicas y combinaciones distintas. ¡Elige el que más te guste!',
            },
            {
              step: '3',
              icon: '🎯',
              title: 'Espera el inicio',
              desc: 'El anfitrión de la sala arranca la partida. En ese momento empezará a sacar cartas una por una.',
            },
            {
              step: '4',
              icon: '👆',
              title: 'Marca tus cartas',
              desc: 'Cuando se anuncie una carta (por ejemplo "Q♥ — Reina de Corazones"), busca esa carta en tu tablero y tócala para marcarla. Las cartas marcadas se resaltan en verde.',
            },
            {
              step: '5',
              icon: '🏆',
              title: 'Canta el premio',
              desc: 'Cuando hayas marcado las cartas suficientes para completar una combinación ganadora (una fila, columna o diagonal), presiona el botón "¡Cantaré!" y selecciona el premio que lograste.',
            },
          ].map(s => (
            <div key={s.step} className="flex gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg">
                {s.step}
              </div>
              <div>
                <p className="font-bold text-gray-800">{s.icon} {s.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Importante:</strong> Solo puedes marcar cartas que hayan sido anunciadas por el anfitrión.
          Si marcas una carta que no fue cantada y declaras ganador, la reclamación no será válida.
        </div>
      </Section>

      {/* ── 5. Combinaciones ganadoras ────────────────────────────────── */}
      <Section id="combinaciones" title="5. Combinaciones ganadoras">
        <p className="text-gray-600">
          Las combinaciones se forman con las 5 cartas de una <strong>fila</strong>, <strong>columna</strong> o{' '}
          <strong>diagonal</strong> de tu tablero. Las etiquetas del tablero ya te indican qué combinación
          puedes armar en cada línea.
        </p>

        <div className="space-y-4">

          <WinBox
            title="1 PAR"
            badge="Más frecuente"
            badgeColor="bg-gray-100 text-gray-700"
            description="Dos cartas del mismo valor dentro de una línea de 5. Es la combinación más fácil de lograr."
            example={
              <CardRow cards={[
                { value: '9', suit: '♣', highlighted: true },
                { value: '10', suit: '♥', faded: true },
                { value: '9', suit: '♠', highlighted: true },
                { value: '3', suit: '♦', faded: true },
                { value: 'K', suit: '♥', faded: true },
              ]} />
            }
          />

          <WinBox
            title="2 PARES"
            badge="Común"
            badgeColor="bg-yellow-50 text-yellow-700"
            description="Dos pares de valores distintos dentro de una línea de 5 cartas."
            example={
              <CardRow cards={[
                { value: '10', suit: '♣', highlighted: true },
                { value: 'K', suit: '♠', faded: true },
                { value: '10', suit: '♠', highlighted: true },
                { value: '5', suit: '♦', highlighted: true },
                { value: '5', suit: '♥', highlighted: true },
              ]} />
            }
          />

          <WinBox
            title="TRÍO"
            badge="Intermedio"
            badgeColor="bg-orange-50 text-orange-700"
            description="Tres cartas del mismo valor dentro de una línea de 5. Exactamente tres — si hay cuatro, es Póker."
            example={
              <CardRow cards={[
                { value: '8', suit: '♥', highlighted: true },
                { value: '9', suit: '♥', faded: true },
                { value: '8', suit: '♠', highlighted: true },
                { value: '8', suit: '♦', highlighted: true },
                { value: '3', suit: '♥', faded: true },
              ]} />
            }
          />

          <WinBox
            title="FULL"
            badge="Difícil"
            badgeColor="bg-purple-50 text-purple-700"
            description="Un trío más un par en la misma línea de 5 cartas. Por ejemplo, tres Jotas y dos Doses."
            example={
              <CardRow cards={[
                { value: 'J', suit: '♣', highlighted: true },
                { value: 'J', suit: '♥', highlighted: true },
                { value: 'J', suit: '♠', highlighted: true },
                { value: '2', suit: '♦', highlighted: true },
                { value: '2', suit: '♥', highlighted: true },
              ]} />
            }
          />

          <WinBox
            title="PÓKER"
            badge="Muy difícil"
            badgeColor="bg-red-50 text-red-700"
            description="Cuatro cartas del mismo valor en una línea de 5. El quinto puede ser cualquier carta."
            example={
              <CardRow cards={[
                { value: 'Q', suit: '♥', highlighted: true },
                { value: 'Q', suit: '♣', highlighted: true },
                { value: 'Q', suit: '♠', highlighted: true },
                { value: 'Q', suit: '♦', highlighted: true },
                { value: '4', suit: '♥', faded: true },
              ]} />
            }
          />

          <WinBox
            title="ESCALERA SIMPLE"
            badge="Difícil"
            badgeColor="bg-teal-50 text-teal-700"
            description="Cinco cartas de valores consecutivos (ej: 5–6–7–8–9), sin importar el palo. El As puede contar como 1 (baja) o como 14 (alta)."
            example={
              <CardRow cards={[
                { value: '5', suit: '♣', highlighted: true },
                { value: '6', suit: '♥', highlighted: true },
                { value: '7', suit: '♠', highlighted: true },
                { value: '8', suit: '♦', highlighted: true },
                { value: '9', suit: '♣', highlighted: true },
              ]} />
            }
          />

          <WinBox
            title="ESCALERA REAL"
            badge="La más difícil"
            badgeColor="bg-blue-50 text-blue-700"
            description="La escalera alta 10–J–Q–K–A, sin importar el palo. Es la combinación más valiosa del juego."
            example={
              <CardRow cards={[
                { value: '10', suit: '♥', highlighted: true },
                { value: 'J', suit: '♠', highlighted: true },
                { value: 'Q', suit: '♣', highlighted: true },
                { value: 'K', suit: '♦', highlighted: true },
                { value: 'A', suit: '♥', highlighted: true },
              ]} />
            }
          />

          <WinBox
            title="FILA COLOR"
            badge="Difícil"
            badgeColor="bg-pink-50 text-pink-700"
            description="Cinco cartas del mismo color (todas rojas ♥♦ o todas negras ♠♣) en una línea completa."
            example={
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">Ejemplo rojo (♥ ♦):</p>
                  <CardRow cards={[
                    { value: 'Q', suit: '♥', highlighted: true },
                    { value: '3', suit: '♦', highlighted: true },
                    { value: 'J', suit: '♥', highlighted: true },
                    { value: '7', suit: '♦', highlighted: true },
                    { value: 'A', suit: '♥', highlighted: true },
                  ]} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">Ejemplo negro (♠ ♣):</p>
                  <CardRow cards={[
                    { value: '5', suit: '♠', highlighted: true },
                    { value: 'K', suit: '♣', highlighted: true },
                    { value: '9', suit: '♠', highlighted: true },
                    { value: '2', suit: '♣', highlighted: true },
                    { value: '10', suit: '♠', highlighted: true },
                  ]} />
                </div>
              </div>
            }
          />
        </div>

        {/* Resumen de dificultad */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-700 mb-3">Resumen de combinaciones</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left px-3 py-2 rounded-l">Combinación</th>
                  <th className="text-left px-3 py-2">Descripción corta</th>
                  <th className="text-left px-3 py-2 rounded-r">Dificultad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['1 PAR', '2 cartas del mismo valor', '⭐'],
                  ['2 PARES', '2 pares distintos', '⭐⭐'],
                  ['TRÍO', '3 del mismo valor', '⭐⭐'],
                  ['ESCALERA SIMPLE', '5 valores consecutivos', '⭐⭐⭐'],
                  ['FILA COLOR', '5 cartas del mismo color', '⭐⭐⭐'],
                  ['FULL', 'Trío + Par', '⭐⭐⭐'],
                  ['PÓKER', '4 del mismo valor', '⭐⭐⭐⭐'],
                  ['ESCALERA REAL', '10–J–Q–K–A', '⭐⭐⭐⭐⭐'],
                ].map(([combo, desc, stars]) => (
                  <tr key={combo} className="bg-white hover:bg-gray-50">
                    <td className="px-3 py-2 font-bold text-gray-800">{combo}</td>
                    <td className="px-3 py-2 text-gray-500">{desc}</td>
                    <td className="px-3 py-2">{stars}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── 6. Roles ──────────────────────────────────────────────────── */}
      <Section id="roles" title="6. Roles: Jugador y Anfitrión">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-2xl mb-2">👤</p>
            <h3 className="font-bold text-gray-800 mb-2">Jugador</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>✓ Se une a la sala con un código</li>
              <li>✓ Elige su tablero antes del inicio</li>
              <li>✓ Marca cartas cuando son anunciadas</li>
              <li>✓ Declara ganador cuando completa una combinación</li>
              <li>✓ Puede activar/desactivar el anuncio de voz</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-2xl mb-2">👑</p>
            <h3 className="font-bold text-gray-800 mb-2">Anfitrión</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>✓ Inicia y termina la partida</li>
              <li>✓ Saca cartas (manual o automático)</li>
              <li>✓ Puede pausar y reanudar el juego</li>
              <li>✓ Configura la velocidad de las cartas (3s, 5s, 10s)</li>
              <li>✓ Si se desconecta, otro jugador puede tomar el rol</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
          <strong>¿Quién es el anfitrión?</strong> Lo verás identificado con una corona 👑 en la pantalla
          de juego. Si el anfitrión se desconecta y la partida queda pausada, cualquier jugador puede
          tomar el control con el botón "Tomar control".
        </div>
      </Section>

      {/* ── 7. Consejos ───────────────────────────────────────────────── */}
      <Section id="consejos" title="7. Consejos para ganar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: '👁️',
              title: 'Lee las etiquetas antes de empezar',
              tip: 'Antes de que arranque el juego, estudia qué combinaciones tienen tus filas y columnas. Así sabes qué cartas necesitas.',
            },
            {
              icon: '🎯',
              title: 'Enfócate en 2 o 3 líneas',
              tip: 'No intentes completar todo el tablero. Elige 2 o 3 líneas con buenas combinaciones y concéntrate en ellas.',
            },
            {
              icon: '🔊',
              title: 'Activa la voz',
              tip: 'El botón de audio repite en voz alta cada carta cantada. Útil si estás pendiente de varias líneas al mismo tiempo.',
            },
            {
              icon: '⚡',
              title: 'Marca rápido',
              tip: 'No dejes acumular cartas sin marcar. Si el anfitrión usa velocidad automática, las cartas llegan rápido.',
            },
            {
              icon: '🃏',
              title: 'Elige bien tu tablero',
              tip: 'Antes de la partida puedes ver los tableros disponibles. Algunos tienen más combinaciones "fáciles" en sus líneas.',
            },
            {
              icon: '🏆',
              title: 'Declara en cuanto puedas',
              tip: '¡No esperes! Apenas tengas una combinación completa, presiona "¡Cantaré!". Otro jugador podría ganar antes.',
            },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-2xl mb-1">{c.icon}</p>
              <p className="font-bold text-gray-800 text-sm mb-1">{c.title}</p>
              <p className="text-xs text-gray-500">{c.tip}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-gray-400 text-sm mb-3">¿Listo para jugar?</p>
        <Link
          href="/lobby"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition inline-block"
        >
          Ir al Lobby
        </Link>
      </div>

    </div>
  )
}
