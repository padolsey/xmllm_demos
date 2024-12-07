import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add a custom header to indicate if this is the colors page
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-is-colors-page', request.nextUrl.pathname === '/colors' ? '1' : '0')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/:path*',
} 