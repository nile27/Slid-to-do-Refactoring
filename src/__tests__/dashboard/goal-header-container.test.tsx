import React from 'react'

import {render, screen} from '@testing-library/react'

import GoalTitleHeader from '@/components/goals-parts/goal-title-header'

jest.mock('@/hooks/use-custom-query', () => ({
    useCustomQuery: jest.fn().mockReturnValue({data: {progress: 50}}),
}))

jest.mock('@/lib/common-api', () => ({
    get: jest.fn(),
}))

describe('GoalTitleHeader', () => {
    it('제목과 링크를 렌더링한다', () => {
        render(<GoalTitleHeader goalId={1} title="테스트 목표" isDashboard />)

        expect(screen.getByText('테스트 목표')).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute('href', '/goals/1')
    })

    it('progress bar를 렌더링한다', () => {
        render(<GoalTitleHeader goalId={1} title="테스트 목표" isDashboard />)

        expect(screen.getByText('Progress')).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })
})
