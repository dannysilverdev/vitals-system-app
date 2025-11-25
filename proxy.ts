// proxy.ts (desbloquea acceso para que el cliente maneje la sesión)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // dejamos la raíz redirigir según cookies (si están)
  const hasAccessToken = !!req.cookies.get('sb-access-token')?.value;
  const hasRefreshToken = !!req.cookies.get('sb-refresh-token')?.value;

  if (pathname === '/') {
    if (hasAccessToken || hasRefreshToken) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    } else {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // NO bloqueamos otras rutas en server: permitimos que el cliente haga la verificación
  // Esto evita el problema donde el token está en localStorage y no en cookies.
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/operadores/:path*', '/maquinas/:path*', '/reportes/:path*', '/entities/:path*', '/usage/:path*', '/admin/:path*']
};
