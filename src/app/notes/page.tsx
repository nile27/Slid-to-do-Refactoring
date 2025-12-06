'use client'

import Image from 'next/image'
import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

import clsx from 'clsx'

import LoadingSpinner from '@/components/common/loading-spinner'
import {useCustomQuery} from '@/hooks/use-custom-query'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'
import {goals, notes as note} from '@/lib/query-keys'

import {NoteList} from '../../components/notes/list'

import type {ApiError} from '@/types/api'
import type {GoalsListResponse} from '@/types/goals'
import type {InfiniteScrollOptions} from '@/types/infinite-scroll'
import type {NoteCommon} from '@/types/notes'

const Page = () => {
    const parameters = useSearchParams()
    const goalId = parameters.get('goalId') as string
    const [selectGoals, setSelectGoals] = useState<boolean>(false)
    const goalsReference = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const {
        data: notes,
        isLoading,
        ref,
        hasMore,
    } = useInfiniteScrollQuery({
        queryKey: note.list(goalId).queryKey,
        fetchFn: note.list(goalId).queryFn,
    } as InfiniteScrollOptions<NoteCommon>)

    const {data: goalData, isLoading: isGoalLoading} = useCustomQuery(
        goals.detail(goalId).queryKey,
        goals.detail(goalId).queryFn,
        {
            enabled: !!goalId && notes.length === 0,
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const apiError = error as ApiError
                return apiError.message || '알 수 없는 오류가 발생했습니다.'
            },
        },
    )

    // goal_list
    const {data: goal_list} = useCustomQuery<GoalsListResponse>(goals.list().queryKey, goals.list().queryFn, {
        errorDisplayType: 'toast',
        mapErrorMessage: (error) => {
            const apiError = error as ApiError
            return apiError.message || '알 수 없는 오류가 발생했습니다.'
        },
    })

    // selectBox
    const handleSelect = (id: number) => {
        setSelectGoals(false)
        router.push(`notes?goalId=${id}`)
    }

    const selectedGoal = goal_list?.goals?.find((goal) => goal.id === Number(goalId)) || goalData // 현재 선택된 목표
    const otherGoals = goal_list?.goals?.filter((goal) => goal.id !== Number(goalId)) || []

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event_: MouseEvent) => {
            const t = event_.target as Node
            if (goalsReference.current?.contains(t)) return
            setSelectGoals(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    if (isLoading || isGoalLoading) {
        return <LoadingSpinner />
    }
    hasMore && !isLoading && notes.length > 0 && <div ref={ref} />

    return (
        <div className="bg-slate-100 flex flex-col w-full min-h-screen h-full overflow-y-auto">
            <div className="desktop-layout min-h-screen flex flex-col">
                <header>
                    <h1 className="text-subTitle text-custom_slate-900 ">
                        {!goalId && <span>모든 </span>}노트 모아보기
                    </h1>
                </header>

                <div className={clsx('w-full  flex-1 flex flex-col', goalId ? 'mt-4' : 'mt-0')}>
                    {goalId && (
                        <div ref={goalsReference} className="relative w-full">
                            <div
                                onClick={() => setSelectGoals((previous) => !previous)}
                                className={`w-full cursor-pointer appearance-none py-3.5 px-8 bg-white rounded-xl border border-custom_slate-100 bg-[url('/goals/flag-goal.svg')] bg-no-repeat bg-[length:28px_28px] bg-[left_1rem_center] pl-14 ${selectGoals && 'rounded-b-none'} flex items-center justify-between`}
                            >
                                <div className="text-subTitle-sm truncate">{selectedGoal?.title}</div>
                                <div className="flex-shink-0">
                                    <Image
                                        src="/notes/down-fill.svg"
                                        alt="down"
                                        width={20}
                                        height={20}
                                        className={`transition-transform duration-200 ${selectGoals ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>

                            {selectGoals && (
                                <div className="absolute z-10 w-full bg-white border border-custom_slate-100 rounded-t-none rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {selectedGoal && ( //선택된 목표
                                        <div
                                            key={selectedGoal.id}
                                            onClick={() => handleSelect(selectedGoal.id)}
                                            className="px-4 py-2 cursor-pointer bg-custom_slate-200 truncate"
                                        >
                                            {selectedGoal.title}
                                        </div>
                                    )}
                                    {otherGoals.map(
                                        // 선택되지 않은 목표
                                        (goal) => (
                                            <div
                                                key={goal.id}
                                                onClick={() => handleSelect(goal.id)}
                                                className="px-4 py-2 cursor-pointer hover:bg-custom_slate-50 truncate"
                                            >
                                                {goal.title}
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {notes.length > 0 ? (
                        <>
                            {hasMore && !isLoading && notes.length > 0 && <div ref={ref} />}

                            <NoteList notesData={notes} />
                            {!hasMore && notes.length > 0 && (
                                <div className="mt-4 text-gray-400 text-sm flex items-center justify-center">
                                    <p>모든 노트를 다 불러왔어요</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full  flex-1 flex items-center justify-center">
                            <p className="text-sm font-normal text-custom_slate-500">아직 등록된 노트가 없어요</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page
