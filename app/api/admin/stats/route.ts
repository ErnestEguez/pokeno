import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/adminGuard'

export async function GET() {
  const { error } = await requireAdminApi()
  if (error) return error

  const admin = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [usersResult, activeRoomsResult, monthlyRoomsResult] = await Promise.all([
    admin.from('users').select('id, is_enabled', { count: 'exact', head: false }).eq('is_enabled', true),
    admin.from('rooms').select('id', { count: 'exact', head: true }).in('status', ['playing', 'paused']),
    admin.from('rooms').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
  ])

  return NextResponse.json({
    active_users: usersResult.count ?? 0,
    active_rooms: activeRoomsResult.count ?? 0,
    rooms_this_month: monthlyRoomsResult.count ?? 0,
  })
}
