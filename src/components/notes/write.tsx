'use client'

import Image from 'next/image'
import {useRouter} from 'next/navigation'
import {useCallback, useEffect, useMemo, useState} from 'react'

import axios from 'axios'

import 'react-toastify/dist/ReactToastify.css'

import TwoButtonModal from '@/components/common/modal/two-buttom-modal'
import MarkdownEditor from '@/components/editor/markdown-editor'
import ButtonStyle from '@/components/style/button-style'
import {useCustomMutation} from '@/hooks/use-custom-mutation'
import useModal from '@/hooks/use-modal'
import useToast from '@/hooks/use-toast'
import {notes} from '@/lib/query-keys'
import {useModalStore} from '@/store/use-modal-store'
import {getTextFromHtml} from '@/utils/text-from-html'

import NoteSaveToast from '../common/note-save-toast'
import InputStyle from '../style/input-style'

const NoteWriteCompo = ({
    goalId,
    todoId,
    goalTitle,
    todoTitle,
}: {
    goalId: string
    todoId: string
    goalTitle: string | undefined
    todoTitle: string | undefined
}) => {
    const router = useRouter()

    const [saveToastOpen, setSaveToastOpen] = useState<boolean>(false)
    const [hasLocalNote, setHasLocalNote] = useState(false)
    const [content, setContent] = useState<string>('')
    const [subject, setSubject] = useState<string>('')
    const [saveSubject, setSaveSubject] = useState<string>('')
    const [saveContent, setSaveContent] = useState<string>('')
    const [linkButton, setLinkButton] = useState<string | undefined>(undefined)

    const {clearModal} = useModalStore()

    const {showToast} = useToast()

    const key = `note-draft-${goalId}-${todoId}`

    /** 작성페이지 검사 */
    useEffect(() => {
        const saved = localStorage.getItem(key)

        if (saved) {
            const parsed = JSON.parse(saved)
            setSaveSubject(parsed.editSubject)
            setSaveContent(parsed.editContent)
            setSaveToastOpen(true)
        }
    }, [key, router])

    /** 임시작성 함수 */
    const [toastMessage, setToastMessage] = useState('')
    const saveToLocalStorage = useCallback(
        (editContent: string) => {
            if ((content === '<p></p>' || content === '') && subject === '') {
                showToast('제목 또는 내용을 입력해주세요.')
                return
            }

            const value = JSON.stringify({
                goalId,
                todoId,
                editContent,
                editSubject: subject,
                editLink: linkButton,
            })
            localStorage.setItem(key, value)
            /** 임시저장 toast open */
            setToastMessage('임시 작성이 완료되었습니다')
        },
        [goalId, todoId, subject, content, key, linkButton, showToast],
    )

    /** 5분에 한번 임시작성 */
    useEffect(() => {
        if (!goalId || !todoId) return
        if ((content === '<p></p>' || content === '') && subject === '') return
        if (saveContent === content && saveSubject === subject) return

        const interval = setInterval(
            () => {
                saveToLocalStorage(content)
            },
            5 * 60 * 1000,
        )

        return () => clearInterval(interval)
    }, [goalId, todoId, content, subject, saveToLocalStorage, saveContent, saveSubject])

    /** 임시작성 불러오기 모달 */
    const comeSave = () => {
        setHasLocalNote(true)
        clearModal()
    }
    const {openModal} = useModal(
        () => (
            <TwoButtonModal
                handleLeftBtn={clearModal}
                handleRightBtn={comeSave}
                topText={`'${saveSubject === '' || saveSubject === undefined ? '제목없음' : saveSubject}'`}
                bottomText={'제목의 노트를 불러오시겠어요?'}
                buttonText={'불러오기'}
            />
        ),
        {
            modalAnimation: 'slideFromTop',
            backdropAnimation: 'fade',
        },
    )

    /** 임시작성 불러오기 클릭 시 내용저장 */
    useEffect(() => {
        if (hasLocalNote) {
            const saved = localStorage.getItem(`note-draft-${goalId}-${todoId}`)
            if (saved) {
                const parsed = JSON.parse(saved)
                setContent(parsed.editContent || '')
                setSubject(parsed.editSubject || '')
                setLinkButton(parsed.editLink || undefined)
            }

            setSaveToastOpen(false)
        }
    }, [hasLocalNote, goalId, todoId, setContent, setSubject, setLinkButton])

    /** 제목 confirm */
    const handleInputUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target
        if (value.length <= 30) {
            setSubject(value)
        } else {
            showToast('제목은 최대 30자까지 입력 가능합니다.')
        }
    }

    /** 내용 value cahnge */
    const handleEditorUpdate = (html: string) => {
        setContent(html)
    }

    /** 작성 완료하기 */
    const {mutate: saveNotes} = useCustomMutation(
        notes.save({
            todoId: Number(todoId),
            title: subject,
            content,
            ...(linkButton && {linkUrl: linkButton}),
        }).queryFn,
        {
            errorDisplayType: 'toast',
            mapErrorMessage: (error) => {
                const typedError = error as {message?: string; response?: {data?: {message?: string}}}

                if (axios.isAxiosError(error)) {
                    return error.response?.data.message || '서버 오류가 발생했습니다.'
                }

                return typedError.message || '알 수 없는 오류가 발생했습니다.'
            },
            onSuccess: () => {
                showToast('작성이 완료되었습니다.')
                router.push(`/notes`)
            },
        },
    )
    const handleSaveNoote = () => {
        if (!confirm('작성을 완료하시겠습니까?')) return
        saveNotes()
    }

    const isChanged = useMemo(() => {
        const titleChanged = subject.trim() !== ''
        const textChanged = getTextFromHtml(content).trim() !== ''
        const urlChanged = (linkButton ?? '').trim() !== ''

        return titleChanged && (textChanged || urlChanged)
    }, [subject, content, linkButton])

    return (
        <>
            <div className="w-full flex justify-between items-center">
                <h1 className="text-subTitle text-custom_slate-900">{'노트 작성'}</h1>
                <div className="flex gap-2">
                    <ButtonStyle
                        className="w-24 !font-normal rounded-xl border-0"
                        color="outline"
                        onClick={() => saveToLocalStorage(content)}
                    >
                        임시작성
                    </ButtonStyle>
                    <ButtonStyle
                        className={`w-24 !font-normal rounded-xl  ${isChanged ? 'bg-blue-500' : 'bg-custom_slate-400'}`}
                        disabled={!isChanged}
                        onClick={() => handleSaveNoote()}
                    >
                        작성완료
                    </ButtonStyle>
                </div>
            </div>
            {saveToastOpen && (
                <div className="mt-4 py-2 px-4 rounded-full bg-custom_blue-50 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-4">
                        <Image
                            src={'/todos/ic-delete.svg'}
                            alt="delete"
                            width={24}
                            height={24}
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => setSaveToastOpen(false)}
                        />
                        <div className="text-custom_blue-500 text-sm font-semibold mobile:text-xs">
                            임시 작성된 노트가 있어요. 작성된 노트를 불러오시겠어요?
                        </div>
                    </div>
                    <ButtonStyle color="outline" className="px-4 w-[84px] rounded-full text-sm h-8" onClick={openModal}>
                        불러오기
                    </ButtonStyle>
                </div>
            )}

            <div className="mt-4 flex items-center gap-2">
                <Image src="/goals/flag-goal.svg" alt="goal-flag" width={24} height={24} />
                <h2 className="text-subTitle-sm truncate">{goalTitle}</h2>
            </div>
            <div className="mt-3 flex items-center gap-2">
                <div className="p-1 bg-custom_slate-100 text-custom_slate-700 text-subBody font-medium rounded-sm shirink-0 whitespace-nowrap">
                    To do
                </div>
                <p className=" text-custom_slate-700 text-subBody font-normal truncate min-w-0">{todoTitle}</p>
            </div>
            <div className="mt-6">
                <div className="border-t border-b flex items-center">
                    <InputStyle
                        type="text"
                        placeholder="노트의 제목을 적어주세요"
                        value={subject}
                        name="title"
                        onChange={handleInputUpdate}
                        className={'bg-white px-0'}
                        maxLength={30}
                    />
                    <div className="text-xs font-medium">{subject.length}/30</div>
                </div>
                <div className="mt-3">
                    <MarkdownEditor
                        value={content}
                        onUpdate={handleEditorUpdate}
                        linkButton={linkButton}
                        onSetLinkButton={setLinkButton}
                    />
                </div>
                {toastMessage && <NoteSaveToast message={toastMessage} onClose={() => setToastMessage('')} />}
            </div>
        </>
    )
}

export default NoteWriteCompo
