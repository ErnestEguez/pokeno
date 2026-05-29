'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionBadge } from '@/components/lobby/SubscriptionBadge'

interface Props {
  displayName: string
  gamesTotal: number
  gamesUsed: number
}

export function AppNavbar({ displayName, gamesTotal, gamesUsed }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <Link href="/lobby" className="text-xl font-bold text-blue-600">
          Pokeno
        </Link>

        <div className="flex items-center gap-3">
          <SubscriptionBadge gamesTotal={gamesTotal} gamesUsed={gamesUsed} />
          <span className="text-sm text-gray-600 hidden sm:block">{displayName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
