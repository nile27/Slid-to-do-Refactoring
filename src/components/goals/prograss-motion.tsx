'use client'

import {useEffect} from 'react'

import {motion, useAnimation} from 'framer-motion'

import type {TodoProgress} from '@/types/todos'

const ProgressBar = ({progress, isDashboard}: TodoProgress) => {
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
        <div className="gap-4 items-center">
            <div className="flex justify-between items-center w-full mt-6 mb-4">
                <div className="text-subBody font-semibold">Progress</div>
                <div className="flex-shrink font-semibold text-subBody">{progress}%</div>
            </div>

            <div className="bg-custom_slate-200 overflow-hidden rounded-full h-3 w-full">
                <motion.div
                    initial={{scaleX: 0}}
                    animate={controls}
                    className={`h-full ${isDashboard ? 'bg-custom_blue-400' : 'bg-custom_slate-800'} origin-left rounded-r-full`}
                />
            </div>
        </div>
    )
}

export default ProgressBar
