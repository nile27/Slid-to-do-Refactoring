import {NextResponse} from 'next/server'

import type {NextRequest} from 'next/server'

export const middleware = (request: NextRequest) => {
    const {pathname} = request.nextUrl
    const accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value
    //  루트 경로 처리 추가

    if (pathname === '/') {
        return NextResponse.redirect(new URL(accessToken && refreshToken ? '/dashboard' : '/login', request.url))
    }
    //  로그인된 사용자가 /login 또는 /signup으로 접근하면 /dashboard로 리디렉션
    if ((pathname === '/login' || pathname === '/signup') && accessToken && refreshToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    //  로그인 안 된 사용자가 보호된 경로 접근 시 /login으로 리디렉션
    const isProtectedPath =
        pathname !== '/login' &&
        pathname !== '/signup' &&
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/api') &&
        !pathname.endsWith('.svg') &&
        !pathname.endsWith('.ico')
    if (isProtectedPath && (!accessToken || !refreshToken)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: [`/((?!_next|_next/image|favicon.ico|api|.*\\.svg$).*)`],
}
