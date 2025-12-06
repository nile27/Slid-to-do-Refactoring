'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect} from 'react'

import axios from 'axios'

import LoadingSpinner from '@/components/common/loading-spinner'
import NoteEditCompo from '@/components/notes/edit'
import NoteWriteCompo from '@/components/notes/write'
import {useCustomQuery} from '@/hooks/use-custom-query'
import useToast from '@/hooks/use-toast'
import {goals, todos} from '@/lib/query-keys'

import type {Goal} from '@/types/goals'

const NoteWritePage = () => {
    const searchParameters = useSearchParams()
    const goalId = searchParameters.get('goalId')
    const todoId = searchParameters.get('todoId')
    const noteId = searchParameters.get('noteId')

    const {showToast} = useToast()

    const isEdit = typeof noteId === 'string'
    const router = useRouter()

    useEffect(() => {
        if (
            (todoId === undefined || todoId === null || goalId === undefined || goalId === null) &&
            (noteId === undefined || noteId === null)
        ) {
            showToast('확인 할 데이터가 없습니다.')
            router.back()
        }
    }, [todoId, goalId, router, noteId, showToast])

    // goal API 호출
    const {data: goalsData, isLoading: isLoadingGoals} = useCustomQuery<Goal>(
        goals.detail(String(goalId)).queryKey,
        goals.detail(String(goalId)).queryFn,
        {
            enabled: !!goalId,
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const typedError = error as {message?: string; response?: {data?: {message?: string}}}

                if (axios.isAxiosError(error)) {
                    return error.response?.data.message || '서버 오류가 발생했습니다.'
                }

                return typedError.message || '목표를 찾을 수 없습니다.'
            },
        },
    )

    // todolist API 호출
    const {data: todosData, isLoading: isLoadingTodos} = useCustomQuery(
        todos.detail(Number(todoId)).queryKey,
        todos.detail(Number(todoId)).queryFn,
        {
            enabled: !!todoId,
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const typedError = error as {message?: string; response?: {data?: {message?: string}}}

                if (axios.isAxiosError(error)) {
                    return error.response?.data.message || '서버 오류가 발생했습니다.'
                }

                return typedError.message || '할일을 찾을 수 없습니다.'
            },
        },
    )

    const isAnyLoading = isLoadingGoals || isLoadingTodos
    if (isAnyLoading) return <LoadingSpinner />

    return (
        <div className="flex flex-col w-full min-h-screen desktop-layout min-w-0">
            <div className="mt-6 w-full">
                {isEdit ? (
                    <NoteEditCompo noteId={noteId!} />
                ) : (
                    <NoteWriteCompo
                        goalId={String(goalId)}
                        todoId={String(todoId)}
                        goalTitle={goalsData?.title}
                        todoTitle={todosData?.title}
                    />
                )}
            </div>
        </div>
    )
}

export default NoteWritePage
