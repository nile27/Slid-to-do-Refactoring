import {post, get, del, patch} from '@/lib/common-api'

import type {NoteCommon, NoteDataProperty, NoteInsertProperty, NoteItemResponse, NoteListResponse} from '@/types/notes'

// dashboard 최근 노트 목록
export const NewNoteListApi = async (): Promise<NoteListResponse> => {
    const response = await get<NoteListResponse>({
        endpoint: `notes`,
    })
    return response.data
}

// 노트 생성 API 호출 함수
export const noteRegApi = async (payload: NoteInsertProperty): Promise<NoteCommon> => {
    const response = await post<NoteCommon>({
        endpoint: `notes`,
        data: payload,
    })
    return response.data
}

// 노트 리스트 조회 API 호출 함수
export const noteListApi = async (goalId?: string, cursor?: number) => {
    try {
        const urlParameter = new URLSearchParams()
        urlParameter.set('size', '10')
        if (goalId) urlParameter.set('goalId', goalId)
        if (cursor !== undefined) urlParameter.set('cursor', String(cursor))
        const endpoint = `notes?${urlParameter.toString()}`

        const result = await get<NoteListResponse>({
            endpoint,
        })
        return {
            data: result.data.notes,
            nextCursor: result.data.nextCursor,
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(String(error))
    }
}

// 노트 삭제 API 호출 함수
export const noteDeleteApi = async (id: number) => {
    await del({endpoint: `notes/${id}`})
}

// 단일 노트 조회 API 호출 함수
export const noteDetailApi = async (noteId: number): Promise<NoteItemResponse> => {
    const result = await get<NoteItemResponse>({
        endpoint: `notes/${noteId}`,
    })
    return result.data
}

// 노트 수정 API 호출 함수
export const noteEditApi = async (noteId: number, payload: Omit<NoteDataProperty, 'id'>): Promise<NoteItemResponse> => {
    const response = await patch<NoteItemResponse>({
        endpoint: `notes/${noteId}`,
        data: payload,
    })

    return response.data
}
