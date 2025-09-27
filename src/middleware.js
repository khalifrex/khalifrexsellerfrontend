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
        console.log('No seller role found, redirecting to /become-seller');
        return NextResponse.redirect(new URL('/become-seller', request.url));
      }

      // Additional server-side seller status check
      try {
        const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092';
        const sellerCheckResponse = await fetch(`${apiURL}/seller/account-status`, {
          method: 'GET',
          headers: {
            'Cookie': `jwt=${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!sellerCheckResponse.ok) {
          // If status check fails, redirect to signin for re-authentication
          console.log('Seller status check failed, redirecting to signin');
          const response = NextResponse.redirect(new URL('/signin', request.url));
          // Clear the JWT cookie since it might be invalid
          response.cookies.delete('jwt');
          return response;
        }

        const sellerStatusData = await sellerCheckResponse.json();
        
        // Handle different response scenarios based on your endpoint structure
        if (!sellerStatusData.success) {
          if (sellerStatusData.redirect === '/become-seller') {
            console.log('No seller account found, redirecting to become-seller');
            return NextResponse.redirect(new URL('/become-seller', request.url));
          }
          
          if (sellerStatusData.redirect === '/signin') {
            console.log('Authentication required, redirecting to signin');
            const response = NextResponse.redirect(new URL('/signin', request.url));
            response.cookies.delete('jwt');
            return response;
          }
        }

        // Check seller account status
        if (sellerStatusData.success && sellerStatusData.status) {
          const status = sellerStatusData.status;
          
          // Block access for inactive, under review, or rejected accounts
          if (status === 'inactive' || status === 'under_review' || 
              status === 'pending_review' || status === 'rejected') {
            console.log(`Seller account status is ${status}, redirecting to signin`);
            return NextResponse.redirect(new URL('/signin', request.url));
          }
          
          // Only allow access for active accounts
          if (status !== 'active') {
            console.log(`Seller account status is ${status}, access denied`);
            return NextResponse.redirect(new URL('/signin', request.url));
          }
        } else {
          // If no valid status returned, deny access
          console.log('No valid seller status returned, redirecting to signin');
          return NextResponse.redirect(new URL('/signin', request.url));
        }

      } catch (statusCheckError) {
        console.error('Seller status check error:', statusCheckError);
        // If we can't verify seller status, redirect to signin for safety
        return NextResponse.redirect(new URL('/signin', request.url));
      }

      console.log('All seller checks passed, proceeding to dashboard');
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