'use client'

import Image from 'next/image'
import React, {useState} from 'react'

import {useQueryClient} from '@tanstack/react-query'

import ButtonStyle from '@/components/style/button-style'
import InputStyle from '@/components/style/input-style'
import {useCustomMutation} from '@/hooks/use-custom-mutation'
import useToast from '@/hooks/use-toast'
import {post} from '@/lib/common-api'
import {useModalStore} from '@/store/use-modal-store'

const GoalModal = () => {
    const [inputChange, setInputChange] = useState('')
    const [inputError, setErrorChange] = useState('')
    const clientQuery = useQueryClient()
    const {clearModal} = useModalStore()
    const {showToast} = useToast()

    const {mutate} = useCustomMutation(
        async () => {
            if (inputChange.length === 0 || !inputChange) {
                throw new Error('목표를 입력해주세요.')
            }
            return await post({
                endpoint: `goals`,
                data: {title: inputChange},
            })
        },
        {
            errorDisplayType: 'none',
            onSuccess: () => {
                showToast('목표가 생성되었습니다.')
                clientQuery.invalidateQueries({queryKey: ['goals']})
                clientQuery.invalidateQueries({queryKey: ['myGoals']})
                clientQuery.invalidateQueries({queryKey: ['navMygoals']})

                clearModal()
            },
            onError: (error) => {
                const status = (error as Error & {status?: number}).status || 500

                if (status !== 500) {
                    setErrorChange('제목을 입력해주세요.')
                }
            },
        },
    )

    const inputOnChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        setInputChange(changeEvent.target.value)
    }

    return (
        <section className=" w-80 mobile:w-75 min-h-65 absolute  transform bg-white -translate-1/2 top-1/2 left-1/2 px-6 py-4 flex flex-col justify-between items-center rounded-xl">
            <header className="flex w-full items-center justify-between mb-2 ">
                <div className={`flex justify-center items-center w-auto h-full `}>
                    <Image src={'/ic-favicon.svg'} alt="Logo" width={32} height={32} className="w-[32px] " />
                    <Image src={'/slid-to-do.svg'} alt="Logo" width={80} height={15} className="w-[80px] h-[15px]" />
                </div>
                <Image
                    src="/todos/ic-close.svg"
                    alt="Close Icon"
                    width={24}
                    height={24}
                    onClick={clearModal}
                    className="cursor-pointer"
                />
            </header>
            <main className=" flex flex-col w-full h-full justify-start items-center mb-6">
                <h1 className=" w-full text-subTitle mb-4">목표 생성</h1>
                <InputStyle
                    type="text"
                    custom_size="default"
                    state={inputError ? 'error' : 'blue'}
                    placeholder="새 목표를 작성해주세요."
                    className="w-full outline"
                    onChange={(changeEvent) => inputOnChange(changeEvent)}
                    maxLength={35}
                />
                <span className=" w-full px-2 text-subBody-sm font-medium text-red-500">{inputError}</span>
            </main>
            <ButtonStyle size="full" onClick={() => mutate()}>
                확인
            </ButtonStyle>
        </section>
    )
}

export default GoalModal
