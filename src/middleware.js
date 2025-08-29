import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export default async function middleware(request) {
  // Only run middleware for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      // Get JWT token from httpOnly cookie
      const token = request.cookies.get('jwt')?.value;

      if (!token) {
        // No token - redirect to signin
        const signinUrl = new URL('/signin', request.url);
        return NextResponse.redirect(signinUrl);
      }

      // Verify JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || '@saqwwjw123mllaa');
      const { payload } = await jwtVerify(token, secret);

      // Check if user has seller role
      if (!payload.roles?.seller) {
        // User logged in but not a seller - redirect to become-seller
        return NextResponse.redirect(new URL('/become-seller', request.url));
      }

      // User is authenticated and has seller role - allow access
      return NextResponse.next();

    } catch (error) {
      console.error('Middleware auth check failed:', error);
      // Invalid token - redirect to signin
      const signinUrl = new URL('/signin', request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', // Protect all dashboard routes
  ],
};