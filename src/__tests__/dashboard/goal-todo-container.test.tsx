import React from 'react'

import {render, screen} from '@testing-library/react'

import GoalTodoContainer from '@/components/goals-parts/goal-todo-container'
import {useCustomQuery} from '@/hooks/use-custom-query'
import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'

// useCustomQuery mock
jest.mock('@/hooks/use-custom-query', () => ({
    useCustomQuery: jest.fn().mockReturnValue({data: {progress: 70}}),
}))

jest.mock('@/hooks/use-infinite-scroll', () => ({
    useInfiniteScrollQuery: jest.fn().mockReturnValue({
        data: [{id: 1, title: '첫 번째 목표'}],
        ref: jest.fn(),
        isLoading: false,
        hasMore: false,
    }),
}))

// 공통 API mock
jest.mock('@/lib/common-api', () => ({
    get: jest.fn(),
}))

jest.mock('@/components/goals-parts/goal-title-header', () => {
    return function MockGoalTitleHeader({title}: {title: string; goalId: number}) {
        return <div data-testid="goal-item">{title}</div>
    }
})

jest.mock('@/components/goals-parts/todo-progress', () => {
    return function MockProgressBar({progress}: {progress: number}) {
        return <div data-testid="progress-bar">{progress}</div>
    }
})

jest.mock('@/components/ui/skeleton/goals/goals-todo-container-skeleton', () => ({
    GoalsTodoContainerSkeleton: jest.fn(() => <div data-testid="goals-todo-skeleton">Loading todo container...</div>),
}))
jest.mock('@/components/ui/skeleton/goals/goal-title-header-skeleton', () => ({
    GoalTitleHeaderSkeleton: jest.fn(() => <div data-testid="goal-header-skeleton">Loading goal header...</div>),
}))
jest.mock('@/components/common/hasmore-loading', () => ({
    HasmoreLoading: jest.fn(() => <div data-testid="loading-more">Loading...</div>),
}))

describe('GoalTodoContainer', () => {
    it('헤더와 progress bar를 렌더한다.', () => {
        render(<GoalTodoContainer isDashboard />)

        expect(screen.getByText('목표 별 할 일')).toBeInTheDocument()
        expect(screen.getByText('70')).toBeInTheDocument()
        expect(screen.getByTestId('goal-item')).toHaveTextContent('첫 번째 목표')
    })

    it('목표가 없으면 "등록된 목표가 없습니다." 메시지를 보여준다', () => {
        ;(useInfiniteScrollQuery as jest.Mock).mockReturnValue({
            data: [],
            ref: jest.fn(),
            isLoading: false,
            hasMore: false,
        })
        render(<GoalTodoContainer />)

        expect(screen.getByText('등록된 목표가 없습니다.')).toBeInTheDocument()
    })

    it('로딩 중이면 skeleton을 보여준다', () => {
        ;(useCustomQuery as jest.Mock).mockReturnValue(0) // progress 로딩 중
        ;(useInfiniteScrollQuery as jest.Mock).mockReturnValue({
            data: [],
            ref: jest.fn(),
            isLoading: true,
            hasMore: true,
        })

        render(<GoalTodoContainer />)

        expect(screen.getByTestId('goals-todo-skeleton')).toBeInTheDocument()
        expect(screen.getByTestId('goal-header-skeleton')).toBeInTheDocument()
    })

    it('hasMore가 true면 "Loading..." 표시', () => {
        ;(useInfiniteScrollQuery as jest.Mock).mockReturnValue({
            data: [{id: 1, title: '더보기 테스트'}],
            ref: jest.fn(),
            isLoading: false,
            hasMore: true,
        })

        render(<GoalTodoContainer />)

        expect(screen.getByTestId('loading-more')).toBeInTheDocument()
    })

    it('hasMore가 false면 "모든 할일을 다 불러왔어요" 표시', () => {
        ;(useCustomQuery as jest.Mock).mockReturnValue({data: {progress: 90}})
        ;(useInfiniteScrollQuery as jest.Mock).mockReturnValue({
            data: [{id: 1, title: '마지막 목표'}],
            ref: jest.fn(),
            isLoading: false,
            hasMore: false,
        })

        render(<GoalTodoContainer />)

        expect(screen.getByText('모든 할일을 다 불러왔어요')).toBeInTheDocument()
    })
})
