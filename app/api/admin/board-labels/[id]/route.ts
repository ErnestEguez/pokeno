import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/adminGuard'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi()
  if (error) return error

  const body = await request.json()
  const { texto } = body

  if (typeof texto !== 'string') {
    return NextResponse.json({ error: 'texto es requerido' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data, error: dbError } = await admin
    .from('board_labels')
    .update({ texto })
    .eq('id', params.id)
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Etiqueta no encontrada' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi()
  if (error) return error

  const admin = createAdminClient()

  const { error: dbError } = await admin
    .from('board_labels')
    .delete()
    .eq('id', params.id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
