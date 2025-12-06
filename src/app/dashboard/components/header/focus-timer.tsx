'use client'

import Image from 'next/image'
import React, {useEffect, useState} from 'react'

import {useFocusTimerStore} from '@/store/timer-store'

import {handleChange} from '../../util/util'

const FocusTimer = () => {
    const {hours, minutes, seconds, isRunning, start, pause, reset, stop, setTime} = useFocusTimerStore()
    const [editMode, setEditMode] = useState(false)
    const [h, setH] = useState(hours)
    const [m, setM] = useState(minutes)
    const [s, setS] = useState(seconds)

    const saveTime = () => {
        setTime(h, m, s)
        setEditMode(false)
    }

    const onMinutes = handleChange(setM)
    const onSeconds = handleChange(setS)

    useEffect(() => {
        if (editMode) {
            setH(hours)
            setM(minutes)
            setS(seconds)
        }
    }, [editMode])

    return (
        <div className="bg-slate-800 text-white p-6 rounded-xl w-full ">
            <header className="flex gap-2 mb-4 text-title-base justify-between items-center ">
                <div className="flex gap-2 text-title-base items-center">
                    <div className="text-white border border-white rounded-xl w-[40px] h-[40px] flex justify-center items-center">
                        <Image src={'/dashboard/clock-filled.svg'} alt="clock" width={20} height={20} />
                    </div>

                    <h2 className=" text-center gap-2 text-lg font-semibold "> 집중 타이머</h2>
                </div>
                {!isRunning && (
                    <div className="flex justify-center gap-2  ">
                        {editMode ? (
                            <button onClick={saveTime} className="px-4 py-2 bg-blue-500 rounded">
                                저장
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-4 py-2 border shadow-sm shadow-custom_slate-300 hover:bg-custom_slate-700 bg-custom_slate-600 text-white rounded"
                            >
                                시간 설정하기
                            </button>
                        )}
                    </div>
                )}
            </header>

            {editMode ? (
                <div className="flex items-center gap-2 justify-center mb-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={h}
                        min={0}
                        max={10}
                        onChange={(event_) => setH(Number(event_.target.value))}
                        className="w-12 text-black px-2 py-2 bg-white font-bold text-center text-2xl outline-none rounded"
                    />
                    <span className="text-3xl font-bold  text-center">:</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        value={m}
                        onChange={onMinutes}
                        className="w-12 text-2xl  px-2 py-2 text-black bg-white font-bold outline-none  text-center rounded"
                    />
                    <span className="text-3xl font-bold text-center">:</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        value={s}
                        onChange={onSeconds}
                        className="w-12 text-2xl  px-2 py-2 text-black bg-white font-bold outline-none text-center rounded"
                    />
                </div>
            ) : (
                <div className="text-5xl font-bold text-center mb-4">
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
                    {String(seconds).padStart(2, '0')}
                </div>
            )}

            {!editMode && (
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
            )}
        </div>
    )
}

export default FocusTimer
