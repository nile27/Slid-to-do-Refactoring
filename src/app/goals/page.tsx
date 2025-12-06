'use client'

import GoalTodoContainer from '@/components/goals-parts/goal-todo-container'

const GoalsListPage = () => {
    return (
        <div className="bg-slate-100 flex flex-col w-full min-h-screen h-full overflow-y-auto">
            <div className="desktop-layout min-h-screen flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-lg font-semibold">목표 리스트</h1>
                </div>
                <GoalTodoContainer isDashboard={false} />
            </div>
        </div>
    )
}

export default GoalsListPage
