import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip auth for public routes
  const publicPaths = ['/signin', '/signup', '/loading']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isPublicPath) {
    return updateSession(request)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return updateSession(request)
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
