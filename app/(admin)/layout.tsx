import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">Pokeno Admin</Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Panel
          </Link>
          <Link
            href="/dashboard/users"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Usuarios
          </Link>
          <Link
            href="/dashboard/board-labels"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Etiquetas de tableros
          </Link>
        </nav>
        <div className="px-4 py-3 border-t border-gray-100">
          <Link href="/lobby" className="text-xs text-gray-400 hover:text-blue-600">
            ← Volver al lobby
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
