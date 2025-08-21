'use client'

import Image from 'next/image'
import {useRouter} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

import {useQueryClient} from '@tanstack/react-query'
import axios from 'axios'

import {dateformat} from '@/components/style/utils'
import {useCustomMutation} from '@/hooks/use-custom-mutation'
import {useCustomQuery} from '@/hooks/use-custom-query'
import useModal from '@/hooks/use-modal'
import useToast from '@/hooks/use-toast'
import {noteDeleteApi, noteDetailApi} from '@/lib/notes/api'
import {useModalStore} from '@/store/use-modal-store'

import LoadingSpinner from '../loading-spinner'
import TwoButtonModal from './two-buttom-modal'

import type {NoteItemResponse} from '@/types/notes'

const SideModal = ({noteId}: {noteId: number}) => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const {showToast} = useToast()

    const {data, isLoading} = useCustomQuery<NoteItemResponse>(['noteDetail', noteId], () => noteDetailApi(noteId), {
        errorDisplayType: 'toast',
        mapErrorMessage: (error_) => {
            if (axios.isAxiosError(error_)) {
                return error_.response?.data.message || '서버 오류가 발생했습니다.'
            }
            return '할 일 상세 정보를 불러오는 데 실패했습니다.'
        },
    })

    const {clearModal} = useModalStore()

    const [moreButton, setMoreButton] = useState<boolean>(false)

    const triggerReference = useRef<HTMLDivElement>(null)
    const menuReference = useRef<HTMLDivElement>(null)

    // 외부 클릭 닫기
    useEffect(() => {
        const handleClickOutside = (event_: MouseEvent) => {
            const t = event_.target as Node
            if (menuReference.current?.contains(t)) return
            if (triggerReference.current?.contains(t)) return
            setMoreButton(false)
        }
        const onEsc = (event_: KeyboardEvent) => {
            if (event_.key === 'Escape') setMoreButton(false)
        }

        if (moreButton) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', onEsc)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', onEsc)
        }
    }, [moreButton, setMoreButton])

    const {mutate: deletNote} = useCustomMutation<void, Error, number>(noteDeleteApi, {
        errorDisplayType: 'toast',
        mapErrorMessage: (error) => {
            const apiError = error as {message?: string; response?: {data?: {message?: string}}}
            if (axios.isAxiosError(apiError)) {
                return apiError.response?.data.message('서버 오류가 발생했습니다.')
            }

            return apiError.message || '알 수 없는 오류가 발생했습니다.'
        },

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notes']})
            queryClient.invalidateQueries({queryKey: ['todos']})
            showToast('삭제가 완료되었습니다')
        },
    })

    /**노트 삭제 확인 모달 */
    const {openModal, closeModal} = useModal(
        <TwoButtonModal
            handleLeftBtn={() => {
                closeModal()
            }}
            handleRightBtn={() => {
                deletNote(noteId)
                closeModal()
            }}
            topText="노트를 삭제하시겠어요?"
            bottomText="삭제된 노트는 복구할 수 없어요"
            buttonText="삭제"
        />,
    )

    return (
        <div className="absolute inset-y-0 right-0 z-50 bg-white lg:w-[800px] sm:w-lg w-full  p-6">
            <Image
                src="/todos/ic-close.svg"
                alt="Close Icon"
                width={24}
                height={24}
                onClick={clearModal}
                className="mb-4 cursor-pointer"
            />
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className=" w-full h-screen min-h-0 flex-1 overflow-y-scroll ">
                    <div className="flex items-center justify-between mb-3 text-base font-medium text-custom_slate-800">
                        <div className="flex gap-1.5">
                            <Image src="/todos/ic-flag.svg" alt="Flag Icon" width={24} height={24} />
                            <div>{data?.goal.title}</div>
                        </div>
                        <div className="justify-end">
                            <div
                                className="flex-shrink-0 cursor-pointer relative"
                                onClick={() => setMoreButton(!moreButton)}
                                role="moreButton"
                                ref={triggerReference}
                            >
                                <Image src="/goals/ic-more.svg" alt="더보기버튼" width={18} height={18} />
                                {moreButton && (
                                    <div
                                        className="w-24 py-2 absolute right-0 top-7 flex gap-2 flex-col rounded text-center shadow-md z-10 bg-white"
                                        ref={menuReference}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                clearModal()
                                                router.push(`/notes/write?noteId=${noteId}`)
                                            }}
                                        >
                                            수정하기
                                        </button>
                                        <button type="button" onClick={() => openModal()}>
                                            삭제하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="text-xs font-medium text-custom_slate-700 bg-custom_slate-100 py-[1px] px-[3px] rounded-sm">
                                To do
                            </div>
                            <div className="text-sm text-custom_slate-700">{data?.todo.title}</div>
                        </div>
                        <div className="text-xs text-custom_slate-500">{dateformat(data?.createdAt)}</div>
                    </div>

                    <h2 className="py-3 mb-3 text-lg font-medium border-t border-b border-custom_slate-200 text-custom_slate-800">
                        {data?.title}
                    </h2>

                    {data?.linkUrl && (
                        <div className="my-4 bg-custom_slate-200 p-1 rounded-full flex justify-between   items-center">
                            <div className="flex items-end gap-2">
                                <Image src="/markdown-editor/ic-save-link.svg" alt="링크이동" width={24} height={24} />
                                <a href={data?.linkUrl} target="_blank" className="inline-block" rel="noreferrer">
                                    {data?.linkUrl}
                                </a>
                            </div>
                        </div>
                    )}

                    <p
                        className="text-custom_slate-700 prose break-words  mb-30  "
                        dangerouslySetInnerHTML={{__html: data?.content || ''}}
                    />
                </div>
            )}
        </div>
    )
}

export default SideModal
