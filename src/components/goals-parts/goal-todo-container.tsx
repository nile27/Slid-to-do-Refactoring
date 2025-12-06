'use client'

import Image from 'next/image'
import React, {useState} from 'react'

import {useCustomQuery} from '@/hooks/use-custom-query'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'
import {get} from '@/lib/common-api'
import {todos, goals} from '@/lib/query-keys'

import GoalTitleHeader from './goal-title-header'
import ProgressBar from './todo-progress'
import {HasmoreLoading} from '../common/hasmore-loading'
import {GoalTitleHeaderSkeleton} from '../ui/skeleton/goals/goal-title-header-skeleton'
import {GoalsTodoContainerSkeleton} from '../ui/skeleton/goals/goals-todo-container-skeleton'

import type {GoalResponse} from '@/types/goals'

const GoalTodoContainer = ({isDashboard = true}: {isDashboard?: boolean}) => {
    const [totalCount, setTotalCount] = useState(0)
    const getGoalsData = () => {
        return async (cursor: number | undefined) => {
            try {
                const urlParameter = cursor === undefined ? '' : `&cursor=${cursor}`
                const response = await get<{goals: GoalResponse[]; nextCursor: number | undefined; totalCount: number}>(
                    {
                        endpoint: `goals?size=3&sortOrder=newest${urlParameter}`,
                    },
                )
                setTotalCount(response.data.totalCount)
                return {
                    data: response.data.goals,
                    nextCursor: response.data.nextCursor,
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    throw error
                }
                throw new Error(String(error))
            }
        }
    }

    const {data} = useCustomQuery<{progress: number}>(todos.allPrograss().queryKey, todos.allPrograss().queryFn, {})

    const {
        data: fetchGoals,
        ref: goalReference,
        isLoading: loadingGoals,
        hasMore: hasMoreGoals,
    } = useInfiniteScrollQuery<GoalResponse>({
        queryKey: goals.all(),
        fetchFn: getGoalsData(),
    })

    return (
        <section
            className={`w-full flex flex-col h-full min-h-[100px]  min-w-[300px] max-[1074px]:h-[1000px] min-[774px]:h-full border ${isDashboard ? 'border-[#1E40AF]' : 'border-custom_slate-800'} rounded-lg  pb-4`}
        >
            <header
                className={`w-full min-h-[220px] mobile:min-h-[250px] h-auto ${isDashboard ? 'bg-[#1E40AF]' : 'bg-custom_slate-800'} px-5 rounded-t-sm`}
            >
                <div className="flex justify-start items-center pl-4 pt-4 gap-2 mb-3">
                    <Image
                        src={'/dashboard/goals-todo.svg'}
                        alt="goal-todo"
                        width={40}
                        height={40}
                        className="text-white border border-white rounded-xl"
                    />

                    <h1 className="text-title-base font-semibold text-white">목표 별 할 일</h1>
                </div>
                {data ? (
                    <ProgressBar
                        isDashboard={isDashboard}
                        progress={typeof data?.progress === 'number' ? data.progress : 0}
                        totalCount={totalCount}
                    />
                ) : (
                    <GoalsTodoContainerSkeleton />
                )}
            </header>
            <div className="w-full h-full relative overflow-y-auto max-[1074px]:h-[450px]">
                {loadingGoals ? (
                    <GoalTitleHeaderSkeleton />
                ) : (
                    <>
                        {fetchGoals.length === 0 ? (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
                                등록된 목표가 없습니다.
                            </div>
                        ) : (
                            <div className="p-4 w-full h-auto max-[1074px]:h-[1000px]  overflow-y-scroll">
                                {fetchGoals.map((myGoal: GoalResponse) => (
                                    <div key={myGoal.id} className="w-full h-auto flex flex-col rounded-lg p-2 mb-3">
                                        <GoalTitleHeader
                                            title={myGoal.title}
                                            goalId={myGoal.id}
                                            isDashboard={isDashboard}
                                        />
                                    </div>
                                ))}

                                {hasMoreGoals && <HasmoreLoading ref={goalReference} />}

                                {!hasMoreGoals && (
                                    <div className="mt-4 w-full text-center text-gray-400 text-sm">
                                        모든 할일을 다 불러왔어요
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}

export default GoalTodoContainer
