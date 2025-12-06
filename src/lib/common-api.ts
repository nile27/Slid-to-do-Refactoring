import axios from 'axios'

import type {
    GetApiParameters,
    PostApiParameters,
    PatchApiParameters,
    DeleteApiParameters,
    RequestParameters,
    ApiResponse,
    ApiPayload,
} from '@/types/api'
import type {AxiosRequestConfig} from 'axios'

/** 사용법
import { get, post, patch, del } from '@/lib/api'

ex) get
const response = await get<타입>({ endpoint: 'url' })
const todos = response.data

ex) post / patch
const response = await post<타입>({ 
    endpoint: 'url', 
    data: {  } 
})
const newTodo = response.data

ex) delete
const response = await del({ endpoint: 'url' })
*/

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/** axios 인스턴스 생성 */
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 498) {
            if (typeof globalThis !== 'undefined') {
                globalThis.location.href = '/login'
            }
            return error
        }

        if (error.response.status === 401 && !error.config._retry) {
            error.config._retry = true
            try {
                await axios.post(
                    '/api/auth/refresh',
                    {},
                    {
                        withCredentials: true,
                    },
                )
                return axiosInstance(error.config)
            } catch (refreshError) {
                if (axios.isAxiosError(refreshError) && refreshError.response?.status === 498) {
                    globalThis.location.href = '/login'
                }
                return refreshError
            }
        }
        throw error
    },
)

/** 통합 HTTP 요청 함수 - axios 버전 */
export const request = async <T>({method, endpoint, data, options}: RequestParameters): Promise<ApiResponse<T>> => {
    try {
        const config: AxiosRequestConfig = {
            method,
            data,
            headers: options?.headers,
            params: {endpoint},
        }

        const response = await axiosInstance.request<ApiPayload<T>>(config)

        return {
            data: response.data.data ?? (response.data as unknown as T),
            status: response.status,
            message: response.data.message,
        }
    } catch (error) {
        let status = 500
        let message = '에러 발생'

        /** axios 에러일 경우: 서버 응답(response)에 접근 가능 */
        if (axios.isAxiosError(error)) {
            status = error.response?.status ?? 500
            message = error.response?.data?.message || error.message || '에러 발생'
            /** 일반 JS 에러일 경우: Error 객체의 message 사용 */
        } else if (error instanceof Error) {
            const customError = error as Error & {status?: number}
            message = customError.message
            status = customError.status ?? 500
        }
        const customError = new Error(message) as Error & {status: number}
        customError.status = status
        throw customError
        /** console.error(err.status, err.message)해서 접근 */
    }
}

/** HTTP 메서드별 함수 */
export const get = <T>({endpoint, options}: GetApiParameters): Promise<ApiResponse<T>> => {
    return request<T>({method: 'GET', endpoint, options})
}

export const post = <T>({endpoint, data, options}: PostApiParameters): Promise<ApiResponse<T>> => {
    return request<T>({method: 'POST', endpoint, data, options})
}

export const patch = <T>({endpoint, data, options}: PatchApiParameters): Promise<ApiResponse<T>> => {
    return request<T>({method: 'PATCH', endpoint, data, options})
}

export const del = async ({endpoint, options}: DeleteApiParameters): Promise<void> => {
    await request<void>({method: 'DELETE', endpoint, options})
}
