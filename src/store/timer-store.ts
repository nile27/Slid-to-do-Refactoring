import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'

interface TimerState {
    hours: number
    minutes: number
    seconds: number
    remaining: number
    isRunning: boolean
    finishSignal: number
    initialSeconds: number // 초기값 저장용
    setTime: (h: number, m: number, s: number) => void
    start: () => void
    pause: () => void
    stop: () => void
    reset: () => void
}

const applyFrom = (total: number) => ({
    remaining: total,
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
})

export const useFocusTimerStore = create<TimerState>()(
    persist(
        (set, get) => {
            let intervalId: ReturnType<typeof setInterval> | undefined

            const clearTick = () => {
                if (intervalId) {
                    clearInterval(intervalId)
                    intervalId = undefined
                }
            }

            return {
                hours: 0,
                minutes: 0,
                seconds: 0,
                remaining: 0,
                isRunning: false,
                finishSignal: 0,
                initialSeconds: 0,

                setTime: (h, m, s) => {
                    const total = h * 3600 + m * 60 + s
                    if (total === 0) return
                    clearTick()
                    set({
                        ...applyFrom(total),
                        isRunning: false,
                        initialSeconds: total,
                        finishSignal: 0,
                    })
                },

                start: () => {
                    const {isRunning, initialSeconds} = get()
                    if (isRunning) return
                    if (initialSeconds === 0) return

                    set({isRunning: true})
                    intervalId = setInterval(() => {
                        set((state) => {
                            if (state.remaining > 1) {
                                const next = state.remaining - 1
                                return {...state, ...applyFrom(next)}
                            }

                            clearTick()

                            return {
                                ...state,
                                ...applyFrom(state.initialSeconds),
                                isRunning: false,
                                finishSignal: get().finishSignal + 1,
                            }
                        })
                    }, 1000)
                },

                pause: () => {
                    clearTick()
                    set({isRunning: false})
                },

                stop: () => {
                    const {initialSeconds} = get()
                    clearTick()
                    set({...applyFrom(initialSeconds), isRunning: false})
                },

                reset: () => {
                    clearTick()
                    set({
                        remaining: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                        isRunning: false,
                        initialSeconds: 0,
                        finishSignal: 0,
                    })
                },
            }
        },
        {
            name: 'focus-timer',
            storage: createJSONStorage(() => sessionStorage),
            // 새로고침 시 isRunning은 항상 false로 복원
            partialize: (state) => ({
                ...state,
                isRunning: false,
                finishSignal: 0,
            }),
        },
    ),
)
