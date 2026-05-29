import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRow } from '@/types/database'

export async function getCurrentUser(): Promise<UserRow | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data ?? null
}

export async function requireAuth(): Promise<UserRow> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin(): Promise<UserRow> {
  const user = await requireAuth()
  if (!user.is_admin) redirect('/lobby')
  return user
}
