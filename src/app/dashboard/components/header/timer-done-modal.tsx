'use client'

import Image from 'next/image'
import React from 'react'

import ButtonStyle from '@/components/style/button-style'
import {useModalStore} from '@/store/use-modal-store'

const TimerModal = () => {
    const {clearModal} = useModalStore()
    return (
        <section className=" w-80 mobile:w-75 min-h-65 absolute  transform bg-white -translate-1/2 top-1/2 left-1/2 px-6 py-4 flex flex-col justify-between items-center rounded-xl">
            <main className=" flex flex-col w-full h-full justify-center items-center mt-3 mb-6">
                <h1 className=" w-full text-subTitle text-start mb-3">타이머 종료 알림</h1>
                <Image src={'/dashboard/timer-done.svg'} alt="done" width={36} height={36} className="w-full h-auto" />
            </main>
            <ButtonStyle size="full" onClick={() => clearModal()}>
                확인
            </ButtonStyle>
        </section>
    )
}

export default TimerModal
