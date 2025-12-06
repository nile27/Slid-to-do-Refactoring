import type {Goal} from './goals'
import type {Todo} from './todos'

/**노트 응답 공통 타입*/
export interface NoteCommon {
    todo: Todo
    updatedAt: string
    createdAt: string
    title: string
    id: number
    goal: Goal
    userId: number
    teamId: string
}

/**노트 리스트 조회 응답*/
export interface NoteListResponse {
    nextCursor: number
    totalCount: number
    notes: NoteCommon[]
}

/**단일노트 조회 응답
 * & 노트 수정 응답
 * & 노트 생성 응답 (응답 데이터 동일*/
export interface NoteItemResponse extends NoteCommon {
    linkUrl: string
    content: string
}

export interface NoteDataProperty {
    id: number
    title: string
    content: string
    linkUrl?: string
}

export interface NoteInsertProperty {
    todoId: number
    title: string
    content: string
    linkUrl?: string
}