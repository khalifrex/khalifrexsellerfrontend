import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export default async function middleware(request) {
  // Only run middleware for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const token = request.cookies.get('jwt')?.value;
      
      if (!token) {
        const signinUrl = new URL('/signin', request.url);
        return NextResponse.redirect(signinUrl);
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET || '@saqwwjw123mllaa');
      const { payload } = await jwtVerify(token, secret);

      console.log('JWT Payload:', payload); // Debug log - remove after testing

      // Check if user has seller role in JWT token
      if (!payload.roles?.seller) {
        console.log('No seller role found, redirecting to /become-seller'); // Debug log
        return NextResponse.redirect(new URL('/become-seller', request.url));
      }

      console.log('Seller role found, proceeding to dashboard'); // Debug log

      return NextResponse.next();
      
    } catch (error) {
      console.error('Middleware auth check failed:', error);
      const signinUrl = new URL('/signin', request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};