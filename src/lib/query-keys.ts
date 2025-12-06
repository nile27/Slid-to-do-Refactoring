import {goalDataApi, goalDeleteApi, goalListApi, goalUpdateApi} from './goals/api'
import {NewNoteListApi, noteDetailApi, noteEditApi, noteListApi, noteRegApi} from './notes/api'
import {NewTodoListApi, todoDataApi, todoDeleteApi, todoPrograssAll, todoPrograssApi, todoUpdateApi} from './todos/api'
import {getProfile} from './users/api'

import type {NoteDataProperty, NoteInsertProperty} from '@/types/notes'
import type {FilterValue} from '@/types/todos'

// 회원
export const users = {
    user: () => ({
        queryKey: ['userData'] as const,
        queryFn: async () => await getProfile(),
    }),
}

// 목표
export const goals = {
    all: () => ['goal'] as const,
    list: () => ({
        queryKey: ['goals'] as const,
        queryFn: async () => await goalListApi(),
    }),
    detail: (goalId: string) => ({
        queryKey: ['goal', goalId] as const,
        queryFn: async () => await goalDataApi(goalId),
    }),
    update: (goalId: string, goalTitle: string) => ({
        queryFn: async () => await goalUpdateApi(goalId, goalTitle),
    }),
    delete: (goalId: string) => ({
        queryFn: async () => await goalDeleteApi(goalId),
    }),
}

// 할일
export const todos = {
    all: () => ['todos'] as const,
    list: (selectedFilter: FilterValue) => ({
        queryKey: ['todos', selectedFilter] as const,
    }),
    detail: (todoId: number) => ({
        queryKey: ['todos', todoId] as const,
        queryFn: async () => await todoDataApi(todoId),
    }),
    toTodo: (done: boolean) => ['todos', done] as const,
    newTodo: () => ({
        queryKey: ['newTodo'] as const,
        queryFn: async () => NewTodoListApi(),
    }),
    update: () => ({
        queryFn: async ({todoId, newDone}: {todoId: number; newDone: boolean}) => todoUpdateApi(todoId, newDone),
    }),
    delete: () => ({
        queryFn: async (todoId: number) => todoDeleteApi(todoId),
    }),
    prograss: (goalId: number) => ({
        queryKey: ['goal', goalId, 'progress'] as const,
        queryFn: async () => await todoPrograssApi(Number(goalId)),
    }),
    allPrograss: () => ({
        queryKey: ['allProgress'] as const,
        queryFn: async () => todoPrograssAll(),
    }),
}

// 노트
export const notes = {
    all: () => ['notes'] as const,
    list: (goalId: string) => ({
        queryKey: ['notes', goalId] as const,
        queryFn: (cursor?: number) => noteListApi(goalId ?? undefined, cursor),
    }),
    detail: (noteId: number) => ({
        queryKey: ['noteDetail', noteId] as const,
        queryFn: async () => noteDetailApi(noteId),
    }),
    newNotes: () => ({
        queryKey: ['newNotes'] as const,
        queryFn: async () => NewNoteListApi(),
    }),
    EditNotes: (noteId: number, payload: Omit<NoteDataProperty, 'id'>) => ({
        queryFn: async () => noteEditApi(Number(noteId), payload),
    }),
    save: (payload: NoteInsertProperty) => ({
        queryFn: () => noteRegApi(payload),
    }),
}
