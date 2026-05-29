import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/adminGuard'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const admin = createAdminClient()
  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = parseInt(searchParams.get('page_size') ?? '20', 10)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error: dbError, count } = await admin
    .from('users')
    .select('*, subscriptions(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ data, total: count ?? 0, page, page_size: pageSize })
}
