'use client'

import {useEffect, useRef} from 'react'

import useModal from '@/hooks/use-modal'
import {useFocusTimerStore} from '@/store/timer-store'

import TimerModal from '../dashboard/components/header/timer-done-modal'

const TimerProvider = () => {
    const finishSignal = useFocusTimerStore((s) => s.finishSignal)
    const previous = useRef(finishSignal)
    const {openModal} = useModal(<TimerModal />)

    useEffect(() => {
        if (finishSignal > previous.current) {
            previous.current = finishSignal

            openModal()
        }
    }, [finishSignal, openModal])

    return undefined
}
export default TimerProvider
