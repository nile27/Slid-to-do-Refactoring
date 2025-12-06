'use client'

import {useEffect} from 'react'

import {motion, useAnimation} from 'framer-motion'

import type {TodoProgress} from '@/types/todos'

const ProgressBar = ({progress, totalCount = 0, isDashboard}: TodoProgress) => {
    const controls = useAnimation()

    useEffect(() => {
        controls.start({
            scaleX: progress * 0.01,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
            },
        })
    }, [progress, controls])

    return (
        <div className="w-full h-auto gap-4 items-center bg-white p-5 rounded-xl mb-5">
            <div className="flex justify-between items-center w-full mt-3 mb-3  mobile:flex-col mobile:items-start bg-white px-1">
                <div
                    className={`text-body-base font-semibold ${isDashboard ? 'text-[#1E40AF]' : 'text-custom_slate-800'}`}
                >
                    {progress}% complete
                </div>
                <div className="flex-shrink font-semibold text-body-base">총 목표: {totalCount}</div>
            </div>

            <div className="bg-custom_slate-50 overflow-hidden rounded-full h-3 w-full">
                <motion.div
                    initial={{scaleX: 0}}
                    animate={controls}
                    className={`h-full ${isDashboard ? 'bg-custom_blue-400' : 'bg-custom_slate-800'}  origin-left rounded-r-full"`}
                />
            </div>
            <p className="w-full px-1 mt-2 text-gray-700 text-[12px]">*전체 달성률 기준</p>
        </div>
    )
}
export default ProgressBar
