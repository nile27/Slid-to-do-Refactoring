'use client'

import {useRouter} from 'next/navigation'

import axios from 'axios'
import clsx from 'clsx'

import {useCustomQuery} from '@/hooks/use-custom-query'
import {todos} from '@/lib/query-keys'

import LoadingSpinner from '../common/loading-spinner'
import {dateformat} from '../style/utils'

import type {TodoProgress} from '@/types/todos'

const Progress = ({goalId, title, createdAt}: {goalId: number; title: string; createdAt: string}) => {
    const router = useRouter()
    const {data, isLoading} = useCustomQuery<TodoProgress>(
        todos.prograss(goalId).queryKey,
        todos.prograss(goalId).queryFn,
        {
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const typedError = error as {message?: string; response?: {data?: {message?: string}}}

                if (axios.isAxiosError(error)) {
                    return error.response?.data.message || '서버 오류가 발생했습니다.'
                }

                return typedError.message || '알 수 없는 오류가 발생했습니다.'
            },
        },
    )

    const progress = data?.progress ?? 0

    if (isLoading) return <LoadingSpinner />

    return (
        <div className="">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/goals/${goalId}`)}>
                <div className="text-subTitle font-medium w-full truncate flex gap-2 items-center justify-between">
                    <div className="flex items-center gap-2">
                        {progress <= 0 && (
                            <div className="px-2 py-1 text-sm rounded-lg text-white bg-custom_slate">미완료</div>
                        )}
                        {progress > 0 && progress <= 99 && (
                            <div className="px-2 py-1 text-sm rounded-lg text-white bg-orange-500">진행중</div>
                        )}
                        {progress >= 100 && (
                            <div className="px-2 py-1 text-sm rounded-lg text-white bg-custom_blue-500">완료</div>
                        )}

                        {title}
                    </div>
                    <div className="text-subBody text-custom_blue-900">{dateformat(createdAt)}</div>
                </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">할 일 100% 중 {progress}% 완료</div>
            <div className="mt-2 flex items-center gap-2 w-full">
                <div className="flex-1 bg-custom_slate-50 h-2 rounded-lg overflow-hidden relative">
                    {progress > 0 && (
                        <div
                            className={clsx(
                                'h-full',
                                `${progress > 0 && progress <= 99 && 'bg-orange-400'}`,
                                `${progress >= 100 && 'bg-custom_blue-400'}`,
                            )}
                            style={{width: `${progress}%`}}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Progress
