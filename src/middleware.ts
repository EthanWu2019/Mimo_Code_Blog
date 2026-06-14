import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieSize = cookieHeader.length;
  
  // Vercel 的 header 限制大约是 8KB，我们设置 6KB 作为安全阈值
  if (cookieSize > 6000) {
    console.warn(`[middleware] Cookie too large: ${cookieSize} bytes, clearing...`);
    
    const response = NextResponse.redirect(new URL('/login?reset=cookie_too_large', request.url));
    
    // 清除所有 NextAuth 相关的 cookie
    const cookieNames = ['next-auth.session-token', 'next-auth.callback-url', 
                         'next-auth.csrf-token', '__Secure-next-auth.session-token',
                         '__Secure-next-auth.callback-url', '__Secure-next-auth.csrf-token',
                         '__Host-next-auth.csrf-token'];
    
    cookieNames.forEach(name => {
      response.cookies.delete(name);
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 只对需要认证的页面应用 middleware
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
