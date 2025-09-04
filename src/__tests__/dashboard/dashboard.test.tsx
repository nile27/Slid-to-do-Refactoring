import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {act, render, screen} from '@testing-library/react'

import DashBoardPage from '@/app/dashboard/page'

export interface TodoData {
    totalTodos: number
    completedTodos: number
    pendingTodos: number
}

const mockTodos = [
    {id: 1, title: '테스트 할일 1', done: false},
    {id: 2, title: '테스트 할일 2', done: false},
]

const mockGoals = [
    {id: 1, title: '테스트 목표 1', description: '테스트 설명 1'},
    {id: 2, title: '테스트 목표 2', description: '테스트 설명 2'},
]
jest.mock('@/lib/common-api', () => ({
    get: jest.fn().mockImplementation((url) => {
        if (url.includes('goals')) {
            return Promise.resolve({
                data: {
                    goals: mockGoals,
                    nextCursor: 123,
                    totalCount: 2,
                },
            })
        }

        return Promise.resolve({
            data: {
                goals: mockGoals,
                todos: mockTodos,
                nextCursor: 123,
                totalCount: 2,
            },
        })
    }),
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/dashboard',
    useSearchParams: () => new URLSearchParams(),
}))

describe('Dashboard 컴포넌트', () => {
    it('Dashboard rendering', async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        await act(async () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <DashBoardPage />
                </QueryClientProvider>,
            )
        })

        expect(screen.getByText('대시보드')).toBeInTheDocument()
    })
})
