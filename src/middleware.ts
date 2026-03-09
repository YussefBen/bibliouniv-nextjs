import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  verifyAccessToken, 
  verifyRefreshToken, 
  generateAccessToken, 
  generateRefreshToken 
} from './lib/jwt';

const publicRoutes = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/public') || 
    pathname.includes('.') 
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (publicRoutes.includes(pathname) && accessToken) {
    const accessPayload = await verifyAccessToken(accessToken);
    if (accessPayload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (accessToken) {
    const accessPayload = await verifyAccessToken(accessToken);
    if (accessPayload) {
      return NextResponse.next();
    }
  }


  if (refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    
    if (refreshPayload) {
      const newAccessToken = await generateAccessToken({
        userId: refreshPayload.userId,
        role: refreshPayload.role,
      });

      const newRefreshToken = await generateRefreshToken({
        userId: refreshPayload.userId,
        role: refreshPayload.role,
      });

      const response = NextResponse.next();

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      };

      response.cookies.set('accessToken', newAccessToken, {
        ...cookieOptions,
        maxAge: 15 * 60,
      });

      response.cookies.set('refreshToken', newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    /*
     * Protéger toutes les routes sauf API et fichiers statiques
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};