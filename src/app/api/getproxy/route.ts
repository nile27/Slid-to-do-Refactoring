import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

const handleRequest = async (request: Request, method: HttpMethod) => {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    const {searchParams} = new URL(request.url)
    const endpoint = searchParams.get('endpoint') as string

    if (!accessToken) {
        return NextResponse.json({message: '로그인이 만료 되었습니다.'}, {status: 401})
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_API}/${decodeURIComponent(endpoint)}`
    const headers: HeadersInit = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    }

    const fetchOptions: RequestInit = {
        method,
        headers,
    }

    if (method === 'POST' || method === 'PATCH') {
        const body = await request.json()
        fetchOptions.body = JSON.stringify(body)
    }

    try {
        const response = await fetch(url, fetchOptions)
        const contentType = response.headers.get('content-type')

        const data = contentType?.includes('application/json') ? await response.json() : await response.text()

        return NextResponse.json(data, {status: response.status})
    } catch (error) {
        if (error instanceof Error) {
            const status = (error as Error & {status?: number}).status || 500
            return NextResponse.json({message: 'Proxy Error', error: String(error)}, {status})
        }
    }
}

export const GET = async (request: Request) => handleRequest(request, 'GET')
export const POST = async (request: Request) => handleRequest(request, 'POST')
export const PATCH = async (request: Request) => handleRequest(request, 'PATCH')
export const DELETE = async (request: Request) => handleRequest(request, 'DELETE')
