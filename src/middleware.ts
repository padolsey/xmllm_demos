import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  
  // Add custom headers for page-specific layouts
  requestHeaders.set('x-is-colors-page', request.nextUrl.pathname === '/colors' ? '1' : '0')
  requestHeaders.set('x-is-model-testing', request.nextUrl.pathname.startsWith('/model-testing') ? '1' : '0')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/:path*',
} 