'use client'

import Image from 'next/image'
import {useCallback, useRef, useState} from 'react'

import {useQueryClient} from '@tanstack/react-query'
import axios from 'axios'
import clsx from 'clsx'
import {useDropzone} from 'react-dropzone'

import ButtonStyle from '@/components/style/button-style'
import InputStyle from '@/components/style/input-style'
import {useCustomMutation} from '@/hooks/use-custom-mutation'
import {useCustomQuery} from '@/hooks/use-custom-query'
import useToast from '@/hooks/use-toast'
import {patch} from '@/lib/common-api'
import {todos, goals as goalList} from '@/lib/query-keys'
import {useModalStore} from '@/store/use-modal-store'

import LoadingSpinner from '../loading-spinner'

import type {GoalsListResponse} from '@/types/goals'
import type {PatchTodoRequest, PostTodoRequest, TodoResponse} from '@/types/todos'

const EditTodoModal = ({todoDetail}: {todoDetail: TodoResponse}) => {
    const queryClient = useQueryClient()

    const [inputs, setInputs] = useState<PostTodoRequest>({
        title: todoDetail.title,
        goalId: todoDetail.goal.id,
        fileUrl: todoDetail.fileUrl || '',
        linkUrl: todoDetail.linkUrl || '',
    })

    const [isCheckedFile, setIsCheckedFile] = useState<boolean>(!!todoDetail.fileUrl)
    const [isCheckedLink, setIsCheckedLink] = useState<boolean>(!!todoDetail.linkUrl)
    const [file, setFile] = useState<File | undefined>()

    const fileInputReference = useRef<HTMLInputElement>(null)

    const {clearModal} = useModalStore()

    const {showToast} = useToast()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
        }
    }, [])

    const {getRootProps, getInputProps} = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
        },
        onDrop,
    })

    const {data: goals, isLoading: isLoadingGoals} = useCustomQuery<GoalsListResponse>(
        goalList.list().queryKey,
        goalList.list().queryFn,
        {
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const typedError = error as {message?: string; response?: {data?: {message?: string}}}

                if (axios.isAxiosError(error)) {
                    return error.response?.data.message || '서버 오류가 발생했습니다.'
                }

                return typedError.message || '알 수 없는 오류가 발생했습니다.'
            },
        },
    )

    const uploadFileMutation = useCustomMutation<string>(
        async () => {
            const formData = new FormData()

            if (!file) {
                throw new Error('파일이 선택되지 않았습니다.')
            }

            formData.append('file', file)

            const response = await fetch('/api/upload?endpoint=files', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('파일 업로드에 실패했습니다.')
            }

            const {url} = await response.json()

            return url
        },
        {
            errorDisplayType: 'toast',
            mapErrorMessage: (error_) => {
                const typedError = error_ as {message?: string; response?: {data?: {message?: string}}}
                if (axios.isAxiosError(error_)) {
                    return error_.response?.data.message || '서버 오류가 발생했습니다.'
                }
                return typedError.message || '파일 업로드에 실패했습니다.'
            },
        },
    )

    const submitForm = useCustomMutation<void, Error, void>(
        async () => {
            const payload: PatchTodoRequest = {
                title: inputs.title,
                goalId: inputs.goalId,
            }

            if (isCheckedFile && file) {
                const fileUrl = await uploadFileMutation.mutateAsync()
                payload.fileUrl = fileUrl
            }

            if (isCheckedLink) {
                payload.linkUrl = inputs.linkUrl
            }

            await patch({
                endpoint: `todos/${todoDetail.id}`,
                data: payload,
            })
        },
        {
            errorDisplayType: 'toast',
            mapErrorMessage: (error_) => {
                const typedError = error_ as {message?: string; response?: {data?: {message?: string}}}
                if (axios.isAxiosError(error_)) {
                    return error_.response?.data.message || '서버 오류가 발생했습니다.'
                }
                return typedError.message || '할 일 수정 중 오류가 발생했습니다.'
            },
            onSuccess: () => {
                showToast('할 일 수정이 완료되었습니다.')
                queryClient.invalidateQueries({queryKey: todos.all()})
                clearModal()
            },
        },
    )

    const handleInputUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target

        setInputs((previousData) => ({
            ...previousData,
            [name]: value,
        }))
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]

        if (selectedFile) {
            if (selectedFile.size > 3 * 1024 * 1024) {
                showToast('파일 크기는 3MB 이하로 제한됩니다.')
                return
            }
            setFile(selectedFile)
        }
    }

    const handleSubmit = () => {
        submitForm.mutate()
    }

    return (
        <div className="absolute flex flex-col justify-between w-full h-full p-6 transform bg-white -translate-1/2 top-1/2 left-1/2 md:rounded-xl md:h-auto md:w-lg">
            <div>
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">할 일 수정</div>
                    <Image
                        src="/todos/ic-close.svg"
                        alt="Close Icon"
                        width={24}
                        height={24}
                        onClick={clearModal}
                        className="cursor-pointer"
                    />
                </div>

                {/* 제목 */}
                <div className="flex flex-col gap-3 mt-6">
                    <div className="text-base font-semibold">제목</div>
                    <InputStyle
                        type="text"
                        placeholder="할 일의 제목을 적어주세요"
                        value={inputs.title}
                        name="title"
                        onChange={handleInputUpdate}
                        maxLength={30}
                    />
                </div>

                {/* 목표 드롭다운 */}
                <div className="mt-6">
                    <div className="text-base font-semibold">목표</div>
                    {isLoadingGoals ? (
                        <LoadingSpinner />
                    ) : (
                        <select
                            value={inputs.goalId || ''}
                            onChange={(event) => setInputs({...inputs, goalId: Number(event.target.value)})}
                            className="w-full px-5 py-3 rounded-md bg-custom_slate-50 appearance-none"
                        >
                            <option value="" disabled>
                                목표를 선택하세요
                            </option>
                            {goals?.goals?.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.title}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* 자료 */}
                <div className="flex flex-col gap-3 mt-6">
                    <div className="text-base font-semibold">자료</div>
                    <div className="flex items-center gap-3">
                        <div
                            className={clsx(
                                'flex items-center gap-2 p-2 font-medium rounded-lg',
                                isCheckedFile
                                    ? 'bg-custom_slate-900 text-white'
                                    : 'bg-custom_slate-100 text-custom_slate-800',
                            )}
                            onClick={() => setIsCheckedFile(!isCheckedFile)}
                        >
                            <Image
                                src={
                                    isCheckedFile
                                        ? '/todos/ic-checkbox-active-white.svg'
                                        : '/todos/ic-checkbox-inactive.svg'
                                }
                                alt="Checkbox Icon"
                                width={18}
                                height={18}
                            />
                            파일 업로드
                        </div>

                        <div
                            className={clsx(
                                'flex items-center gap-2 p-2 font-medium rounded-lg',
                                isCheckedLink
                                    ? 'bg-custom_slate-900 text-white'
                                    : 'bg-custom_slate-100 text-custom_slate-800',
                            )}
                            onClick={() => setIsCheckedLink(!isCheckedLink)}
                        >
                            <Image
                                src={
                                    isCheckedLink
                                        ? '/todos/ic-checkbox-active-white.svg'
                                        : '/todos/ic-checkbox-inactive.svg'
                                }
                                alt="Checkbox Icon"
                                width={18}
                                height={18}
                            />
                            링크 첨부
                        </div>
                    </div>

                    {isCheckedLink && (
                        <InputStyle
                            type="text"
                            placeholder="링크를 입력해주세요"
                            value={inputs.linkUrl}
                            name="linkUrl"
                            onChange={handleInputUpdate}
                        />
                    )}

                    {(isCheckedFile || inputs.fileUrl) && (
                        <div
                            tabIndex={0}
                            className="flex flex-col items-center justify-center gap-2 py-4 bg-custom_slate-50 rounded-xl"
                            onClick={() => {
                                fileInputReference.current?.click()
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    fileInputReference.current?.click()
                                }
                            }}
                            {...getRootProps()}
                        >
                            {file || inputs.fileUrl ? (
                                <Image src="/todos/ic-uploaded.svg" alt="Uploaded Icon" width={24} height={24} />
                            ) : (
                                <Image src="/todos/ic-plus.svg" alt="Plus Icon" width={24} height={24} />
                            )}

                            {file ? (
                                <div className="max-w-xs px-2 text-center truncate text-custom_slate-400">
                                    {file.name}
                                </div>
                            ) : (
                                <div className="w-full max-w-xs px-4 text-center truncate text-custom_slate-400">
                                    {inputs.fileUrl || '파일을 업로드해주세요'}
                                </div>
                            )}

                            <input
                                type="file"
                                hidden
                                ref={fileInputReference}
                                onChange={handleFileChange}
                                {...getInputProps()}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 확인 버튼 */}
            <div className="mt-6">
                <ButtonStyle
                    size="full"
                    disabled={!inputs.title.trim() || !inputs.goalId || submitForm.isPending}
                    onClick={handleSubmit}
                >
                    수정하기
                </ButtonStyle>
            </div>
        </div>
    )
}

export default EditTodoModal
