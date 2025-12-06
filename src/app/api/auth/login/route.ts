import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

const URL = process.env.NEXT_PUBLIC_BACKEND_API

export const POST = async (request: Request) => {
    const {email, password} = await request.json()
    const cookie = await cookies()

    try {
        const response = await fetch(`${URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                {message: data.message || '로그인 실패', error: data.error},
                {status: response.status},
            )
        }

        cookie.set({
            name: 'accessToken',
            value: data.accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60,
        })

        cookie.set({
            name: 'refreshToken',
            value: data.refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        })

        return NextResponse.json({success: true})
    } catch {
        return NextResponse.json({message: '서버 통신 오류가 발생했습니다.'}, {status: 500})
    }
}
