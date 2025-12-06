import {del, get, patch} from '@/lib/common-api'

import type {TodoProgress} from '@/types/todos'
import type {Todo, TodoListDetailResponse, TodoResponse} from '@/types/todos'

// dashboard 최근 할일 목록
export const NewTodoListApi = async (): Promise<TodoListDetailResponse> => {
    const response = await get<TodoListDetailResponse>({
        endpoint: `todos`,
    })
    return response.data
}

// 할일 API 호출 함수
export const todoDataApi = async (todoId: number): Promise<Todo> => {
    const endpoint = `todos/${todoId}`
    const response = await get<Todo>({
        endpoint,
    })

    return response.data
}

// 할일 update API 함수
export const todoUpdateApi = async (todoId: number, newDone: boolean): Promise<TodoResponse> => {
    const response = await patch<TodoResponse>({
        endpoint: `todos/${todoId}`,
        data: {done: newDone},
    })

    return response.data
}

// 할일 delete API 함수
export const todoDeleteApi = async (todoId: number): Promise<void> => {
    const response = await del({
        endpoint: `todos/${todoId}`,
    })
    return response
}

// goal prograss API 함수
export const todoPrograssApi = async (goalId: number): Promise<TodoProgress> => {
    const response = await get<TodoProgress>({
        endpoint: `todos/progress?goalId=${goalId}`,
    })
    return response.data
}

// 할일 전체 prograss
export const todoPrograssAll = async () => {
    const response = await get<{progress: number}>({
        endpoint: `todos/progress`,
    })

    return {
        progress: response.data.progress,
    }
}

// 할일 무한스크롤 리스트
export const TodoListApi = (done: boolean, goalId: number) => {
    return async (cursor: number | undefined) => {
        let endpoint = `todos?goalId=${goalId}&done=${done}&size=10`
        if (cursor !== undefined) {
            endpoint += `&cursor=${cursor}`
        }

        const result = await get<{
            todos: TodoResponse[]
            nextCursor: number | undefined
        }>({
            endpoint,
        })
        return {
            data: result.data.todos,
            nextCursor: result.data.nextCursor,
        }
    }
}
