import * as nextNavigation from 'next/navigation'
import React, {useState} from 'react'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import {waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import GoalHeader from '@/components/goals/goal-header'
import useToast from '@/hooks/use-toast'
import * as api from '@/lib/common-api'

const mockGoal = {
    id: 2479,
    title: '아바타 사진찍기!!',
}

// useParams 모킹
jest.mock('next/navigation', () => ({
    ...jest.requireActual('next/navigation'),
    useParams: jest.fn(),
    useRouter: jest.fn(),
}))

// useToast 모킹
jest.mock('@/hooks/use-toast')
let mockShowToast: jest.Mock

// api통신 모킹
jest.mock('@/lib/common-api')
const mockedGet = api.get as jest.MockedFunction<typeof api.get>

beforeEach(() => {
    mockShowToast = jest.fn()
    ;(nextNavigation.useParams as jest.Mock).mockReturnValue({goalId: String(mockGoal.id)})
    ;(useToast as jest.Mock).mockReturnValue({
        showToast: mockShowToast,
    })
    mockedGet.mockReset()
})

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })

function renderWithClient(ui: React.ReactElement) {
    const queryClient = createQueryClient()
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

// 테스트를 위한 GoalHeader props 객체
const headerProperties = (overrides = {}) => ({
    goal: mockGoal,
    goalTitle: mockGoal.title,
    goalEdit: false,
    setGoalEdit: jest.fn(),
    moreButton: false,
    setMoreButton: jest.fn(),
    goalDeleteModal: jest.fn(),
    handleInputUpdate: jest.fn(),
    handleGoalAction: jest.fn(),
    ...overrides,
})

describe('api 모킹', () => {
    it('API 호출이 올바르게 발생하는지 확인', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {progress: 50},
            status: 200,
        })

        renderWithClient(<GoalHeader {...headerProperties()} />)

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledTimes(1)
            expect(mockedGet).toHaveBeenCalledWith(
                expect.objectContaining({
                    endpoint: expect.stringContaining('todos/progress'),
                }),
            )
        })
    })
})

describe('goalHeader 화면', () => {
    it('goal이 있고 goalEdit가 false 일 때 목표 제목이 화면에 보여야 한다.', async () => {
        renderWithClient(<GoalHeader {...headerProperties()} />)

        const title = await screen.findByText('아바타 사진찍기!!')
        expect(title).toBeInTheDocument()
    })
    it('goal이 없을 때 loaging 표시', async () => {
        renderWithClient(<GoalHeader {...headerProperties({goal: undefined})} />)

        const loading = await screen.findByText('loading...')
        expect(loading).toBeInTheDocument()
    })
    it('goalEdit가 true 일 때 input이 보여야한다.', async () => {
        renderWithClient(<GoalHeader {...headerProperties({goalEdit: true})} />)

        const placeholder = await screen.findByPlaceholderText('목표를 입력해주세요')
        expect(placeholder).toBeInTheDocument()
    })
    it('goalEdit가 true 일 때 수정버튼이 보여야한다.', async () => {
        renderWithClient(<GoalHeader {...headerProperties({goalEdit: true})} />)

        const updateButton = await screen.findByRole('button', {name: '수정'})
        const cancleButton = await screen.findByRole('button', {name: '취소'})

        expect(updateButton).toBeInTheDocument()
        expect(cancleButton).toBeInTheDocument()
    })
})

describe('목표 달성률 PrograssBar', () => {
    it('API에서 받아온 progress 값이 ProgressBar에 표시된다', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {progress: 75},
            status: 200,
        })

        renderWithClient(<GoalHeader {...headerProperties()} />)

        expect(await screen.findByText('75%')).toBeInTheDocument()
    })

    it('빈 progress 응답일 때 기본값 0%가 렌더링된다', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {},
            status: 200,
        })

        renderWithClient(<GoalHeader {...headerProperties()} />)

        expect(await screen.findByText('0%')).toBeInTheDocument()
    })
})

describe('버튼 클릭 이벤트', () => {
    it('취소 버튼 클릭 시 input이 사라지고 제목이 다시 보여야 한다.', async () => {
        const user = userEvent.setup()

        const GoalHeaderTestWrapper = () => {
            const [goalEdit, setGoalEdit] = useState(true)

            return (
                <GoalHeader
                    {...headerProperties({
                        goalEdit,
                        setGoalEdit,
                        goal: {
                            id: 1,
                            title: '아바타 사진찍기!!',
                        },
                    })}
                />
            )
        }

        renderWithClient(<GoalHeaderTestWrapper />)

        const input = await screen.findByPlaceholderText('목표를 입력해주세요')
        expect(input).toBeInTheDocument()

        await user.click(await screen.findByRole('button', {name: '취소'}))

        await waitFor(() => {
            expect(screen.queryByPlaceholderText('목표를 입력해주세요')).not.toBeInTheDocument()
            expect(screen.getByText('아바타 사진찍기!!')).toBeInTheDocument()
        })
    })
    it('수정 버튼 클릭 시 handleGoalAction이 호출되고 "edit" 인자가 전달되어야 한다', async () => {
        const user = userEvent.setup()
        const mockHandleGoalAction = jest.fn()

        renderWithClient(
            <GoalHeader
                {...headerProperties({
                    handleGoalAction: mockHandleGoalAction,
                    goalEdit: true,
                    goalTitle: '다른 제목',
                })}
            />,
        )

        const editButton = await screen.findByRole('button', {name: '수정'})

        await user.click(editButton)

        expect(mockHandleGoalAction).toHaveBeenCalledTimes(1)
        expect(mockHandleGoalAction).toHaveBeenCalledWith('edit')
    })
    it('더보기 버튼 클릭 시 setMoreButton이 호출되어야 한다', async () => {
        const user = userEvent.setup()
        const mockSetMoreButton = jest.fn()

        renderWithClient(
            <GoalHeader
                {...headerProperties({
                    moreButton: false,
                    setMoreButton: mockSetMoreButton,
                })}
            />,
        )

        const moreButton = await screen.findByRole('moreButton')
        await user.click(moreButton)

        expect(mockSetMoreButton).toHaveBeenCalledTimes(1)
        expect(mockSetMoreButton).toHaveBeenCalledWith(true)
    })
    it('더보기 메뉴가 열려있을 때 수정하기, 삭제하기 버튼이 보여야 한다', async () => {
        renderWithClient(<GoalHeader {...headerProperties({moreButton: true})} />)

        expect(await screen.findByText('수정하기')).toBeInTheDocument()
        expect(await screen.findByText('삭제하기')).toBeInTheDocument()
    })

    it('목표 빈 제목이면 수정되지 않고 toast 호출', async () => {
        const user = userEvent.setup()

        renderWithClient(<GoalHeader {...headerProperties({goalEdit: true, goalTitle: ''})} />)

        const updateButton = await screen.findByRole('button', {name: '수정'})

        await user.click(updateButton)
        expect(mockShowToast).toHaveBeenCalled()
        mockShowToast.mockClear()
    })

    it('수정하기 클릭 시 setGoalEdit(true) 호출', async () => {
        const user = userEvent.setup()
        const mockSetGoalEditButton = jest.fn()

        renderWithClient(
            <GoalHeader
                {...headerProperties({
                    moreButton: true,
                    setGoalEdit: mockSetGoalEditButton,
                })}
            />,
        )

        const editButton = await screen.findByRole('button', {name: '수정하기'})
        await user.click(editButton)

        expect(mockSetGoalEditButton).toHaveBeenCalledTimes(1)
        expect(mockSetGoalEditButton).toHaveBeenCalledWith(true)
    })
    it('삭제하기 클릭 시 goalDeleteModal 호출', async () => {
        const user = userEvent.setup()
        const mockSetGoalDeleteButton = jest.fn()

        renderWithClient(
            <GoalHeader
                {...headerProperties({
                    moreButton: true,
                    goalDeleteModal: mockSetGoalDeleteButton,
                })}
            />,
        )

        const deleteButton = await screen.findByRole('button', {name: '삭제하기'})
        await user.click(deleteButton)

        expect(mockSetGoalDeleteButton).toHaveBeenCalled()
        expect(mockSetGoalDeleteButton).toHaveBeenCalledTimes(1)
    })
})
