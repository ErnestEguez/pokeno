import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const boardNumber = searchParams.get('board_number')

  if (!boardNumber) {
    return NextResponse.json({ error: 'board_number es requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('board_labels')
    .select('tipo, posicion, texto')
    .eq('board_number', parseInt(boardNumber, 10))
    .order('posicion', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
