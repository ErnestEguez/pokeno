import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNavbar } from '@/components/AppNavbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('display_name, subscriptions(games_total, games_used)')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = (userData?.subscriptions as any) as { games_total: number; games_used: number } | null

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar
        displayName={userData?.display_name ?? user.email ?? 'Usuario'}
        gamesTotal={subscription?.games_total ?? 0}
        gamesUsed={subscription?.games_used ?? 0}
      />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
