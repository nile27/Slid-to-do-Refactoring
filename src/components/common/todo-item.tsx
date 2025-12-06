'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

import {useModal} from '@/hooks/use-modal'

import SideModal from './modal/side-modal'

import type {TodoResponse} from '@/types/todos'

/** SSR-안전 포탈 컴포넌트 */

const Portal = ({children}: {children: React.ReactNode}) => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return undefined
    return createPortal(children, document.body)
}

const TodoItem = ({
    todoDetail,
    onToggle,
    onEdit,
    onDelete,
    isGoal = false,
}: {
    todoDetail: TodoResponse
    onToggle: (todoId: number, newDone: boolean, goalId?: number) => void
    onEdit?: (todoId: number) => void
    onDelete?: (todoId: number) => void
    isGoal?: boolean
}) => {
    const [isGoalTitleOpen, setIsGoalTitleOpen] = useState(false)
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)

    const triggerReference = useRef<HTMLDivElement>(null)
    const menuReference = useRef<HTMLDivElement>(null)

    // 메뉴 좌표 (뷰포트 기준)
    const [pos, setPos] = useState<{top: number; left: number}>({top: 0, left: 0})

    const router = useRouter()

    // 모달 열기 함수
    const {openModal} = useModal((noteId: number) => <SideModal noteId={noteId} />, {
        modalAnimation: 'slideFromRight',
    })

    // 외부 클릭 닫기
    useEffect(() => {
        const handleClickOutside = (event_: MouseEvent) => {
            const t = event_.target as Node
            if (menuReference.current?.contains(t)) return
            if (triggerReference.current?.contains(t)) return
            setIsContextMenuOpen(false)
        }
        const onEsc = (event_: KeyboardEvent) => {
            if (event_.key === 'Escape') setIsContextMenuOpen(false)
        }

        if (isContextMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', onEsc)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', onEsc)
        }
    }, [isContextMenuOpen])

    // 위치 계산 (열릴 때 + 스크롤/리사이즈 시)
    useLayoutEffect(() => {
        const updatePosition = () => {
            if (!triggerReference.current) return
            const rect = triggerReference.current.getBoundingClientRect()
            // 아이콘의 오른쪽 아래에 붙이고, 메뉴 너비만큼 왼쪽으로 당김
            const estimatedMenuWidth = 80
            const top = rect.bottom + 8
            const left = Math.max(8, rect.right - estimatedMenuWidth)
            setPos({top, left})
        }

        if (isContextMenuOpen) {
            updatePosition()
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true)
            window.removeEventListener('resize', updatePosition)
        }
    }, [isContextMenuOpen])

    const handleMenuClick = (action: () => void) => {
        action()
        setIsContextMenuOpen(false)
    }

    return (
        <div>
            <div className="flex justify-between">
                {/* 체크박스, 제목 영역 */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                        className="flex items-center justify-center rounded-full size-6"
                        onClick={() => onToggle(todoDetail.id, !todoDetail.done)}
                    >
                        <Image
                            src={`${todoDetail?.done ? '/todos/ic-checkbox-active.svg' : '/todos/ic-checkbox-inactive.svg'}`}
                            alt="Checkbox Icon"
                            width={18}
                            height={18}
                        />
                    </div>
                    <div
                        className={`text-sm cursor-pointer hover:underline flex-1 min-w-0 pr-5 ${todoDetail?.done ? 'line-through' : ''}`}
                        onClick={() =>
                            isGoal ? onToggle(todoDetail.id, !todoDetail.done) : setIsGoalTitleOpen(!isGoalTitleOpen)
                        }
                    >
                        <p className="w-full truncate overflow-ellipsis whitespace-nowrap">{todoDetail?.title}</p>
                    </div>
                </div>

                {/* 우측 아이콘 영역 */}
                <div className="flex items-center gap-2 shrink-0">
                    {todoDetail?.fileUrl && (
                        <Image
                            src="/todos/ic-file.svg"
                            alt="File Icon"
                            width={24}
                            height={24}
                            className="cursor-pointer"
                            onClick={() => window.open(todoDetail?.fileUrl)}
                        />
                    )}

                    {todoDetail?.linkUrl && (
                        <Image
                            src="/todos/ic-link.svg"
                            alt="Link Icon"
                            width={24}
                            height={24}
                            className="cursor-pointer"
                            onClick={() => window.open(todoDetail?.linkUrl, '_blank')}
                        />
                    )}

                    {todoDetail?.noteId && (
                        <Image
                            src="/todos/ic-note.svg"
                            alt="Note Icon"
                            width={24}
                            height={24}
                            className="cursor-pointer"
                            onClick={() => openModal(todoDetail?.noteId)}
                        />
                    )}

                    {/* 메뉴 트리거 */}
                    <div className="relative" ref={triggerReference}>
                        <Image
                            src="/todos/ic-menu.svg"
                            alt="Menu Icon"
                            width={24}
                            height={24}
                            className="cursor-pointer"
                            onClick={() => setIsContextMenuOpen((v) => !v)}
                        />
                    </div>
                </div>
            </div>

            {/* 목표 제목 영역 (할일 제목 클릭 시 표시) */}
            {isGoalTitleOpen && (
                <div className="flex items-center gap-1.5 ml-8 text-sm text-custom_slate-700">
                    <Image src="/todos/ic-goal.svg" alt="Goal Icon" width={24} height={24} />
                    <div
                        className="cursor-pointer hover:underline"
                        onClick={() => router.push(`/goals/${todoDetail?.goal.id}`)}
                    >
                        {todoDetail.goal.title}
                    </div>
                </div>
            )}

            {/* 컨텍스트 메뉴 (포탈) */}
            {isContextMenuOpen && (
                <Portal>
                    <div
                        ref={menuReference}
                        role="menu"
                        className="fixed z-50 flex flex-col overflow-hidden text-sm bg-white shadow-lg rounded-xl"
                        style={{top: pos.top, left: pos.left}}
                    >
                        {(todoDetail?.noteId <= 0 || todoDetail?.noteId === undefined) && (
                            <Link
                                className="px-4 py-2 transition cursor-pointer hover:bg-gray-100"
                                href={`/notes/write?goalId=${todoDetail.goal.id}&todoId=${todoDetail.id}`}
                                onClick={() => setIsContextMenuOpen(false)}
                            >
                                노트작성
                            </Link>
                        )}
                        <button
                            type="button"
                            className="text-left px-4 py-2 transition hover:bg-gray-100"
                            onClick={() => handleMenuClick(() => onEdit?.(todoDetail.id))}
                        >
                            수정하기
                        </button>
                        <button
                            type="button"
                            className="text-left px-4 py-2 transition hover:bg-gray-100"
                            onClick={() => handleMenuClick(() => onDelete?.(todoDetail.id))}
                        >
                            삭제하기
                        </button>
                    </div>
                </Portal>
            )}
        </div>
    )
}

export default TodoItem
