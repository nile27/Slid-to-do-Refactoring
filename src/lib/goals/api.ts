import {del, get, patch, post} from '@/lib/common-api'

import type {Goal, GoalsAllListResponse, GoalsListResponse} from '@/types/goals'
import type {TodoResponse} from '@/types/todos'

// goal API 호출 함수
export const goalDataApi = async (goalId: string): Promise<Goal> => {
    const endpoint = `goals/${goalId}`
    const response = await get<Goal>({
        endpoint,
    })

    return response.data
}

// goal update API 함수
export const goalUpdateApi = async (goalId: string, goalTitle: string): Promise<TodoResponse> => {
    const response = await patch<TodoResponse>({
        endpoint: `goals/${goalId}`,
        data: {title: goalTitle},
        options: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
            },
        },
    })

    return response.data
}

// goal delete API 함수
export const goalDeleteApi = async (goalId: string): Promise<void> => {
    await del({
        endpoint: `goals/${goalId}`,
    })
}

// 할일 추가, 수정에서 사용하는 goal list API 함수
export const goalListApi = async (): Promise<GoalsListResponse> => {
    const endpoint = `goals?size=100&sortOrder=newest`
    const response = await get<GoalsListResponse>({
        endpoint,
    })

    return response.data
}

// 목표 리스트(무한스크롤) API 함수
export const goalListPageApi = async (cursor: number | undefined): Promise<GoalsAllListResponse> => {
    const urlParameter = cursor === undefined ? '' : `&cursor=${cursor}`

    const endpoint = `goals?size=6&sortOrder=newest${urlParameter}`

    const response = await get<GoalsListResponse>({endpoint})

    return {
        data: response.data.goals,
        nextCursor: response.data.nextCursor,
        totalCount: response.data.totalCount,
    }
}

// 네비게이션 목표 생성
export const goalCreatApi = async (title: string) => {
    return await post({
        endpoint: `goals`,
        data: {title},
    })
}
