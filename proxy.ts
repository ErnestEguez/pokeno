import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Rutas de juego (solo jugadores, no admin)
  const isGamePath = pathname.startsWith('/lobby') || pathname.startsWith('/rooms')
  // Rutas de administración (solo admin)
  const isAdminPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  // Rutas de autenticación
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register')
  // Cualquier ruta protegida
  const isProtectedPath = isGamePath || isAdminPath

  // Sin sesión → /login
  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Con sesión → no puede entrar a login/register
  if (user && isAuthPath) {
    // Redirigir según el tipo de usuario (se verifica abajo)
    // Por ahora redirigir a / y dejar que la home decida
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Verificar rol cuando el usuario accede a rutas protegidas
  if (user && isProtectedPath) {
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin, is_enabled')
      .eq('id', user.id)
      .single()

    // Usuario deshabilitado
    if (userData && !userData.is_enabled) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?reason=disabled', request.url))
    }

    const isAdmin = userData?.is_admin ?? false

    // Admin intentando acceder a rutas de juego → dashboard
    if (isAdmin && isGamePath) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // No-admin intentando acceder a rutas de admin → lobby
    if (!isAdmin && isAdminPath) {
      return NextResponse.redirect(new URL('/lobby', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
}
