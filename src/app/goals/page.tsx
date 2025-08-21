'use client'

import Image from 'next/image'
import {useRouter} from 'next/navigation'

import LoadingSpinner from '@/components/common/loading-spinner'
import Progress from '@/components/goals/prograss'
import {dateformat} from '@/components/style/utils'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'
import useToast from '@/hooks/use-toast'
import {goalListPageApi} from '@/lib/goals/api'

import type {GoalResponse} from '@/types/goals'

const GoalsListPage = () => {
    const router = useRouter()
    const {showToast} = useToast()

    const {data, isLoading, ref, hasMore, isError, error} = useInfiniteScrollQuery({
        queryKey: ['goals'],
        fetchFn: async (cursor) => goalListPageApi(cursor),
    })

    if (isLoading) return <LoadingSpinner />

    if (error || isError) {
        showToast('목표 리스트를 불러오는 중 오류가 발생했습니다.')
        return <></>
    }

    return (
        <div className="bg-slate-100 flex flex-col w-full min-h-screen h-full overflow-y-auto">
            <div className="desktop-layout min-h-screen flex flex-col">
                <div className="flex items-center justify-between ">
                    <h1 className="text-lg font-semibold">목표 리스트</h1>
                </div>

                {data.length > 0 ? (
                    <>
                        {data.map((goal: GoalResponse) => (
                            <div key={goal.id} className="mt-4 w-full h-full flex-1">
                                <div className="mt-4 bg-white rounded-xl border border-custom_slate-100 p-6">
                                    <div className="bg-white rounded-xl">
                                        <div
                                            className="flex items-center gap-4 cursor-pointer mb-2"
                                            onClick={() => router.push(`/goals/${goal.id}`)}
                                        >
                                            <Image src="/goals/flag-goal.svg" alt="goal-flag" width={40} height={40} />
                                            <div className="text-subTitle font-medium w-full truncate flex gap-2 items-center justify-between">
                                                <div>{goal.title}</div>
                                                <div className="text-subBody text-custom_blue-900">
                                                    {dateformat(goal.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        <Progress goalId={goal.id} />

                                        {/* <ProgressUnmotion goalId={goal.id} /> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {hasMore && <div ref={ref} style={{height: '1px'}} />}
                        {!hasMore && data.length > 0 && (
                            <div className="py-4 text-gray-400 text-sm flex items-center justify-center">
                                <p>모든 목표를 다 불러왔어요</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center text-sm text-custom_slate-500 text-center h-[120px] py-4">
                        목표가 없어요. 새 목표를 만들어주세요.
                    </div>
                )}
            </div>
        </div>
    )
}

export default GoalsListPage
