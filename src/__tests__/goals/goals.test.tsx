import * as nextNavigation from 'next/navigation'
import React from 'react'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {render, waitFor, screen} from '@testing-library/react'

import GoalsPage from '@/app/goals/[goalId]/page'
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
    ;(nextNavigation.useRouter as jest.Mock).mockReturnValue({
        push: jest.fn(), // ✅ push 추가
    })
    ;(useToast as jest.Mock).mockReturnValue({
        showToast: mockShowToast,
    })
    mockedGet.mockReset()
})

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {retry: false},
        },
    })

function renderWithClient(ui: React.ReactElement) {
    const queryClient = createQueryClient()
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('api 호출 테스트', () => {
    it('goalDataApi 호출 확인', async () => {
        mockedGet.mockResolvedValueOnce({
            data: mockGoal,
            status: 200,
        })

        renderWithClient(<GoalsPage />)

        expect(mockedGet).toHaveBeenCalledWith(expect.objectContaining({endpoint: `goals/${mockGoal.id}`}))
    })
    it('todosNotDone(done=false) API가 호출되는지 확인', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {todos: [{id: 1, content: '할 일 항목'}], nextCursor: 2},
            status: 200,
        })

        renderWithClient(<GoalsPage />)

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith({endpoint: `todos?goalId=${mockGoal.id}&done=false&size=10`})
        })
    })
    it('todosDone(done=true) API가 호출되는지 확인', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {todos: [{id: 2, content: '한 일 항목'}], nextCursor: 2},
            status: 200,
        })

        renderWithClient(<GoalsPage />)

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith({endpoint: `todos?goalId=${mockGoal.id}&done=true&size=10`})
        })
    })
    it('API 로딩 중이면 loading-spinner 가 화면에 나타나야 한다', async () => {
        mockedGet.mockImplementationOnce(
            () =>
                new Promise(() => {
                    //응답지연
                }),
        )

        const {container} = renderWithClient(<GoalsPage />)

        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })
    it.each([
        ['done=true', '할 일을 불러오는 중 오류가 발생했습니다.'],
        ['done=false', '할 일을 불러오는 중 오류가 발생했습니다.'],
    ])('endpoint가 %s일 때 toast가 호출되는지 확인', async (endpointSubstring, expectedToastMessage) => {
        // API 에러 상황 강제 트리거
        mockedGet.mockImplementationOnce(({endpoint}) => {
            if (endpoint.includes(endpointSubstring)) {
                return Promise.reject(new Error('API 실패'))
            }
            return Promise.resolve({
                data: {todos: [], nextCursor: 1},
                status: 200,
            })
        })

        renderWithClient(<GoalsPage />)

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(expectedToastMessage)
        })
        mockShowToast.mockClear()
    })
})

describe('클릭 이벤트', () => {
    it('/notes?goalId={goalId}로 이동하는 링크가 렌더링되는지 확인', async () => {
        // 1. goal 데이터
        mockedGet.mockResolvedValueOnce({
            data: mockGoal,
            status: 200,
        })

        // 2. todosNotDone
        mockedGet.mockResolvedValueOnce({
            data: {todos: [], nextCursor: 1},
            status: 200,
        })

        // 3. todosDone
        mockedGet.mockResolvedValueOnce({
            data: {todos: [], nextCursor: 1},
            status: 200,
        })

        renderWithClient(<GoalsPage />)

        const link = await screen.findByRole('link', {name: /노트 모아보기/i})
        expect(link).toHaveAttribute('href', `/notes?goalId=${mockGoal.id}`)
    })
})
