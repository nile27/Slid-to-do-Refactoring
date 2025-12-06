'use client'

import Link from 'next/link'
import React from 'react'

import ProgressBar from '@/components/goals/prograss-motion'
import {useCustomQuery} from '@/hooks/use-custom-query'
import {todos} from '@/lib/query-keys'

import type {TodoProgress} from '@/types/todos'

const GoalTitleHeader = ({goalId, title, isDashboard}: {goalId: number; title: string; isDashboard: boolean}) => {
    const {data: progressData} = useCustomQuery<TodoProgress>(
        todos.prograss(goalId).queryKey,
        todos.prograss(goalId).queryFn,
    )

    return (
        <div className="w-full h-auto p-4 border border-[#D4D5D5] rounded-lg bf-">
            <div className="w-full h-auto p-2 pl-0 flex justify-between items-center min-w-0">
                <Link
                    href={`/goals/${goalId}`}
                    className="flex-1 min-w-0 text-title-base font-semibold cursor-pointer truncate"
                >
                    {title}
                </Link>
            </div>
            <ProgressBar progress={progressData?.progress || 0} isDashboard={isDashboard} />
        </div>
    )
}

export default GoalTitleHeader
