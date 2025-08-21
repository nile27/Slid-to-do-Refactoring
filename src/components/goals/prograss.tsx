'use client'

import axios from 'axios'

import {useCustomQuery} from '@/hooks/use-custom-query'
import {goalPrograssApi} from '@/lib/goals/api'

import LoadingSpinner from '../common/loading-spinner'

import type {GoalProgress} from '@/types/goals'

export default function Progress({goalId}: {goalId: number}) {
    const {data, isLoading} = useCustomQuery<GoalProgress>(
        ['goal', goalId, 'progress'],
        async () => goalPrograssApi(Number(goalId)),
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

    if (isLoading) return <LoadingSpinner />

    const progress = data?.progress ?? 0

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-custom_slate-50 h-1 rounded-lg overflow-hidden relative">
                {progress > 0 && <div className="h-full bg-[#0e0e0e]" style={{width: `${progress}%`}} />}
            </div>
            <span className="text-subBody font-semibold">{progress}%</span>
        </div>
    )
}
