import Image from 'next/image'
import React from 'react'

import {useFocusTimerStore} from '@/store/timer-store'

const SideTimer = () => {
    const {hours, minutes, seconds, isRunning, start, pause, stop, reset} = useFocusTimerStore()

    return (
        <div className="bg-custom_blue-500 text-white  rounded-xl w-full pt-5 mb-4 flex flex-col justify-start items-center gap-3 ">
            <div className="text-3xl font-bold text-center ">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="flex justify-center gap-2 mb-3">
                <div className="flex justify-center gap-2 mb-4">
                    {isRunning ? (
                        <button
                            onClick={pause}
                            className="flex justify-center items-center  w-8 h-8 bg-white rounded-full "
                        >
                            <Image src={'/dashboard/pause.svg'} alt="pause" width={15} height={15} />
                        </button>
                    ) : (
                        <button
                            onClick={start}
                            className=" flex justify-center items-center w-8 h-8 bg-white rounded-full"
                        >
                            <Image src={'/dashboard/play.svg'} alt="play" width={24} height={24} />
                        </button>
                    )}
                    <button onClick={stop} className="flex justify-center items-center  bg-white w-8 h-8 rounded-full">
                        <Image src={'/dashboard/stop.svg'} alt="stop" width={24} height={24} />
                    </button>
                    <button onClick={reset} className="flex justify-center items-center  bg-white rounded-full w-8 h-8">
                        <Image src={'/dashboard/reset.svg'} alt="stop" width={24} height={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SideTimer
