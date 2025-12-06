import React from 'react'

import GoalTodoContainer from '@/components/goals-parts/goal-todo-container'

import Headers from './components/header/header-container'

const DashBoardPage = () => {
    return (
        <section className=" w-full h-screen text-black   text-body-base overflow-x-hidden overflow-y-scroll  bg-slate-100">
            <div className=" w-full h-full desktop-layout  ">
                <h1 className="text-black text-title-base mb-4 ">대시보드</h1>
                <div className=" flex w-full pb-10 h-full  justify-center max-w-[1200px]  gap-4 max-[1074px]:flex-col max-[1074px]:h-auto">
                    <Headers />
                    <GoalTodoContainer />
                </div>
            </div>
        </section>
    )
}

export default DashBoardPage
