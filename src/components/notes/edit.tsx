'use client'

import Image from 'next/image'
import {useRouter} from 'next/navigation'
import React, {useEffect, useRef, useState} from 'react'

import {useQueryClient} from '@tanstack/react-query'

import MarkdownEditor from '@/components/editor/markdown-editor'
import {useCustomMutation} from '@/hooks/use-custom-mutation'
import {useCustomQuery} from '@/hooks/use-custom-query'
import {useIsNoteChanged} from '@/hooks/use-is-note-changed'
import useToast from '@/hooks/use-toast'
import {notes} from '@/lib/query-keys'
import {type NoteItemResponse} from '@/types/notes'

import LoadingSpinner from '../common/loading-spinner'
import ButtonStyle from '../style/button-style'

import type {ApiError} from '@/types/api'

const NoteEditCompo = ({noteId}: {noteId: string}) => {
    const queryClient = useQueryClient()
    const inputReference = useRef<HTMLInputElement>(null)
    const [title, setTitle] = useState<string>('')
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [content, setContent] = useState('')

    const {showToast} = useToast()

    const router = useRouter()

    /** 노트 단일 조회 통신 */
    const {data} = useCustomQuery<NoteItemResponse>(
        notes.detail(Number(noteId)).queryKey,
        notes.detail(Number(noteId)).queryFn,
        {
            enabled: !!noteId,
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const apiError = error as ApiError
                return apiError.message || '노트 정보를 불러오는 데 실패했습니다.'
            },
        },
    )

    const [linkUrl, setLinkUrl] = useState<string | undefined>(data?.linkUrl)

    useEffect(() => {
        if (!data) return
        if (data.title) setTitle(data.title)
        if (data.linkUrl !== undefined) setLinkUrl(data.linkUrl)
        if (data.content) setContent(data.content)
    }, [data])

    useEffect(() => {
        if (isEditingTitle) {
            const timeout = setTimeout(() => {
                inputReference.current?.focus()
            }, 0)

            return () => clearTimeout(timeout)
        }
    }, [isEditingTitle])

    /** 변경값 감지하여 수정하기 버튼 활성화/비활성화 */
    const isChanged = useIsNoteChanged({
        original: {
            title: data?.title ?? '',
            content: data?.content ?? '',
            linkUrl: data?.linkUrl ?? '',
        },
        current: {
            title,
            content,
            linkUrl: linkUrl ?? '',
        },
    })

    const isEmpty = !title || !content

    const handleEditorUpdate = (newContent: string) => {
        setContent(newContent)
    }

    const payload = {
        title,
        content,
        linkUrl: linkUrl || undefined,
    }

    /** 노트 수정 통신*/
    const {mutate: editNote} = useCustomMutation<NoteItemResponse, Error, void>(
        notes.EditNotes(Number(noteId), payload).queryFn,
        {
            errorDisplayType: 'toast',
            mapErrorMessage: (error: Error) => {
                const apiError = error as {status?: number; message?: string}

                if (apiError.message) return error.message
                return '노트를 수정하는 데 실패했습니다.'
            },
            onSuccess: () => {
                showToast('수정이 완료되었습니다!')
                router.push(`/notes`)
                queryClient.invalidateQueries({queryKey: notes.detail(Number(noteId)).queryKey})
            },
        },
    )

    /** 수정하기 버튼 클릭 이벤트 */
    const handleEdit = () => {
        editNote()
    }

    return (
        <>
            {data ? (
                <div>
                    <div className="w-full flex justify-between items-center">
                        <h1 className="text-subTitle text-custom_slate-900">노트 수정</h1>
                        <div className="flex gap-2">
                            <ButtonStyle
                                className="w-24 text-sm font-semibold  rounded-xl"
                                onClick={handleEdit}
                                disabled={!isChanged || isEmpty}
                            >
                                수정하기
                            </ButtonStyle>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 w-full">
                        <Image src="/goals/flag-goal.svg" alt="goal-flag" width={24} height={24} />
                        <h2 className="text-subTitle-sm  truncate min-w-0">{data.goal.title}</h2>
                    </div>
                    <div className="w-full mt-3 flex items-center gap-2">
                        <div className="p-1 bg-custom_slate-100 text-custom_slate-700 text-subBody font-medium rounded-sm shrink-0 whitespace-nowrap">
                            To do
                        </div>
                        <p className=" text-custom_slate-700 text-subBody font-normal flex-1 min-w-0 truncate">
                            {data?.todo.title}
                        </p>
                    </div>

                    <div className="py-3 mt-6 border-y-1 border-custom_slate-200">
                        {isEditingTitle || title === '' ? (
                            <input
                                ref={inputReference}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                onBlur={() => {
                                    if (title !== '') setIsEditingTitle(false)
                                }}
                                maxLength={30}
                                className="w-full text-lg font-medium text-custom_slate-800 bg-transparent outline-none border-none"
                            />
                        ) : (
                            <p
                                onClick={() => setIsEditingTitle(true)}
                                className="text-custom_slate-800 text-lg font-medium cursor-pointer truncate"
                            >
                                {title}
                            </p>
                        )}
                    </div>

                    <div className="mt-3">
                        <MarkdownEditor
                            value={data.content}
                            onUpdate={handleEditorUpdate}
                            linkButton={linkUrl}
                            onSetLinkButton={setLinkUrl}
                        />
                    </div>
                </div>
            ) : (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <LoadingSpinner />
                </div>
            )}
        </>
    )
}

export default NoteEditCompo
