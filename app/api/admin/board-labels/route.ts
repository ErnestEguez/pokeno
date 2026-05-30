import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/adminGuard'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const admin = createAdminClient()
  const { searchParams } = request.nextUrl
  const boardNumber = searchParams.get('board_number')

  let query = admin
    .from('board_labels')
    .select('*')
    .order('tipo', { ascending: true })
    .order('posicion', { ascending: true })

  if (boardNumber) {
    query = query.eq('board_number', parseInt(boardNumber, 10))
  }

  const { data, error: dbError } = await query

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const body = await request.json()
  const { board_number, tipo, posicion, texto } = body

  if (!board_number || !tipo || !posicion) {
    return NextResponse.json({ error: 'board_number, tipo y posicion son requeridos' }, { status: 400 })
  }

  if (!['columna', 'fila'].includes(tipo)) {
    return NextResponse.json({ error: 'tipo debe ser "columna" o "fila"' }, { status: 400 })
  }

  if (posicion < 1 || posicion > 5) {
    return NextResponse.json({ error: 'posicion debe estar entre 1 y 5' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data, error: dbError } = await admin
    .from('board_labels')
    .upsert({ board_number, tipo, posicion, texto: texto ?? '' }, {
      onConflict: 'board_number,tipo,posicion',
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
