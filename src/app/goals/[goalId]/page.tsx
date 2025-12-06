'use client'
import Image from 'next/image'
import Link from 'next/link'
import {useParams, useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'

import {useQueryClient} from '@tanstack/react-query'
import axios from 'axios'

import LoadingSpinner from '@/components/common/loading-spinner'
import AddTodoModal from '@/components/common/modal/add-todo-modal'
import TwoButtonModal from '@/components/common/modal/two-buttom-modal'
import GoalHeader from '@/components/goals/goal-header'
import InfiniteTodoList from '@/components/goals/todo-list'
import {useCustomMutation} from '@/hooks/use-custom-mutation'
import {useCustomQuery} from '@/hooks/use-custom-query'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'
import useModal from '@/hooks/use-modal'
import useToast from '@/hooks/use-toast'
import {goals, todos} from '@/lib/query-keys'
import {TodoListApi} from '@/lib/todos/api'
import {useModalStore} from '@/store/use-modal-store'

import type {Goal} from '@/types/goals'
import type {TodoResponse} from '@/types/todos'

const GoalsPage = () => {
    const router = useRouter()

    const [goal, setGoal] = useState<Goal>()
    const [moreButton, setMoreButton] = useState<boolean>(false)
    const [goalEdit, setGoalEdit] = useState<boolean>(false)
    const [goalTitle, setGoalTitle] = useState<string>('')
    const {showToast} = useToast()

    const queryClient = useQueryClient()

    const parameters = useParams()
    const goalId = parameters.goalId as string

    /**모달 닫기 */
    const {clearModal} = useModalStore()

    /** 목표 GET API */
    const {data: goalData, isLoading: goalGetLoading} = useCustomQuery<Goal>(
        goals.detail(goalId).queryKey,
        goals.detail(goalId).queryFn,
        {
            errorDisplayType: 'both',
            mapErrorMessage: (error) => {
                const typedError = error as {message?: string; response?: {data?: {message?: string}}}

                if (axios.isAxiosError(error)) {
                    return error.response?.data.message || '서버 오류가 발생했습니다.'
                }

                return typedError.message || '알 수 없는 오류가 발생했습니다.'
            },
            errorRedirectPath: '/',
        },
    )

    useEffect(() => {
        if (goalData) {
            setGoal(goalData)
            setGoalTitle(goalData?.title)
        }
    }, [goalData])

    /** 목표 수정 */
    const {mutate: updateGoals, isPending: goalUpdateLoading} = useCustomMutation<TodoResponse>(
        goals.update(goalId, goalTitle).queryFn,
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
                queryClient.invalidateQueries({queryKey: goals.all()})
                showToast('수정이 완료되었습니다.')
            },
        },
    )

    /** 목표 삭제 */
    const {mutate: deleteGoals, isPending: goalDeleteLoading} = useCustomMutation<void>(goals.delete(goalId).queryFn, {
        errorDisplayType: 'toast',
        mapErrorMessage: (error) => {
            const typedError = error as {message?: string; response?: {data?: {message?: string}}}

            if (axios.isAxiosError(error)) {
                return error.response?.data.message || '서버 오류가 발생했습니다.'
            }

            return typedError.message || '알 수 없는 오류가 발생했습니다.'
        },
        onSuccess: () => {
            clearModal()
            showToast('삭제가 완료되었습니다.')
            router.push('/')
        },
    })

    /** 목표 수정&삭제 분기 함수 */
    const handleGoalAction = async (mode: string) => {
        if (mode === 'edit') {
            if (goal?.title === '') {
                showToast('제목을 입력해주세요.')
                return
            }
            updateGoals()

            setGoalEdit(false)
        } else if (mode === 'delete') {
            deleteGoals()
        }
    }

    /**목표 수정 시 input값 변경 */
    const handleInputUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target
        setGoalTitle(value)
    }

    /** 목표 삭제 모달 */
    const {openModal: goalDeleteModal} = useModal(
        () => (
            <TwoButtonModal
                handleLeftBtn={clearModal}
                handleRightBtn={() => handleGoalAction('delete')}
                topText={'목표를 삭제하시겠어요?'}
                bottomText={'삭제된 목표는 복구할 수 없습니다.'}
                buttonText={'삭제'}
            />
        ),
        {
            modalAnimation: 'slideFromTop',
            backdropAnimation: 'fade',
        },
    )

    // 해야 할 일
    const {
        data: todosDone,
        ref: doneReference,
        isLoading: loadingDone,
        hasMore: haseMoreDone,
        isError: doneIsError,
        error: doneError,
    } = useInfiniteScrollQuery<TodoResponse>({
        queryKey: todos.toTodo(true),
        fetchFn: TodoListApi(true, Number(goalId)),
    })

    // 한 일
    const {
        data: todosNotDone,
        ref: notDoneReference,
        isLoading: loadingNotDone,
        hasMore: hasMoreNotDone,
        isError: notDoneIsError,
        error: notDoneError,
    } = useInfiniteScrollQuery<TodoResponse>({
        queryKey: todos.toTodo(false),
        fetchFn: TodoListApi(false, Number(goalId)),
    })

    /**할일 추가 모달 */
    const {openModal: todoAddModal} = useModal(<AddTodoModal goalId={Number(goalId)} />)

    /**할일 checkbox update */
    const {mutate: updateTodo, isPending: todoCheckboxLoading} = useCustomMutation(todos.update().queryFn, {
        errorDisplayType: 'toast',
        mapErrorMessage: (error) => {
            const typedError = error as {message?: string; response?: {data?: {message?: string}}}

            if (axios.isAxiosError(error)) {
                return error.response?.data.message || '서버 오류가 발생했습니다.'
            }

            return typedError.message || '할 일 변경 중 오류가 발생했습니다.'
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: todos.all()})
            queryClient.invalidateQueries({queryKey: goals.all()})
        },
    })

    /**할일 삭제 */
    const {mutate: deleteTodo, isPending: todoDeleteLoading} = useCustomMutation(todos.delete().queryFn, {
        errorDisplayType: 'toast',
        mapErrorMessage: (error) => {
            const typedError = error as {message?: string; response?: {data?: {message?: string}}}

            if (axios.isAxiosError(error)) {
                return error.response?.data.message || '서버 오류가 발생했습니다.'
            }

            return typedError.message || '할 일 삭제 중 오류가 발생했습니다.'
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: todos.all()})
            queryClient.invalidateQueries({queryKey: goals.all()})
        },
    })
    const handleTodoDelete = (todoId: number) => {
        if (!confirm('정말로 이 할 일을 삭제하시겠습니까?')) return
        deleteTodo(todoId)
    }

    // Loading일 때 화면
    const isAnyLoading = [
        todoDeleteLoading,
        todoCheckboxLoading,
        goalDeleteLoading,
        goalUpdateLoading,
        goalGetLoading,
    ].includes(true)

    /**할일 에러 발생 구현 화면 */
    const error = [doneIsError && doneError, notDoneIsError && notDoneError].find(Boolean)

    if (error) {
        showToast('할 일을 불러오는 중 오류가 발생했습니다.')
        return <></>
    }

    return (
        <div className="w-full desktop-layout flex-1 min-w-0 overflow-y-auto">
            <div className="text-subTitle">목표</div>
            <GoalHeader
                goal={goal}
                goalTitle={goalTitle}
                goalEdit={goalEdit}
                setGoalEdit={setGoalEdit}
                moreButton={moreButton}
                setMoreButton={setMoreButton}
                goalDeleteModal={goalDeleteModal}
                handleInputUpdate={handleInputUpdate}
                handleGoalAction={handleGoalAction}
            />

            <Link
                className="mt-6 py-4 px-6 bg-custom_blue-100 flex items-center justify-between rounded-xl cursor-pointer"
                href={`/notes?goalId=${goalId}`}
            >
                <div className="flex gap-2 items-center">
                    <Image src="/goals/note.svg" alt="노트" width={24} height={24} />
                    <div className="text-subTitle">노트 모아보기</div>
                </div>
                <Image src="/goals/ic-arrow-right.svg" alt="노트보기 페이지 이동" width={24} height={24} />
            </Link>

            {isAnyLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="mt-6 flex flex-col lg:flex-row gap-6 justify-between">
                    <InfiniteTodoList
                        title="To do"
                        todos={todosNotDone}
                        isLoading={loadingNotDone}
                        hasMore={hasMoreNotDone}
                        refCallback={notDoneReference}
                        onToggle={(todoId: number, newDone: boolean) => updateTodo({todoId, newDone})}
                        onDelete={(todoId: number) => handleTodoDelete(todoId)}
                        onAddClick={todoAddModal}
                    />

                    <InfiniteTodoList
                        title="Done"
                        todos={todosDone}
                        isLoading={loadingDone}
                        hasMore={haseMoreDone}
                        refCallback={doneReference}
                        onToggle={(todoId: number, newDone: boolean) => updateTodo({todoId, newDone})}
                        onDelete={(todoId: number) => handleTodoDelete(todoId)}
                    />
                </div>
            )}
        </div>
    )
}
export default GoalsPage
