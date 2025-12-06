import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

const URL = process.env.NEXT_PUBLIC_BACKEND_API

export const POST = async () => {
    const cookie = await cookies()
    const refreshToken = cookie.get('refreshToken')?.value

    const response = await fetch(`${URL}/auth/tokens`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${refreshToken}`,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        if (response.status === 401) {
            cookie.delete({name: 'accessToken'})
            cookie.delete({name: 'refreshToken'})
            return NextResponse.json({message: 'Refresh token expired'}, {status: 498})
        }

        return NextResponse.json({message: data.message}, {status: response.status})
    }

    cookie.set({
        name: 'accessToken',
        value: data.accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    })
    cookie.set({
        name: 'refreshToken',
        value: data.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    })

    return NextResponse.json({success: true})
}
