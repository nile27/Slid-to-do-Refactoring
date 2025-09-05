import {fireEvent, render, screen} from '@testing-library/react'
import GoalList from '@/components/navigation/components/goal-list'
import Profile from '@/components/navigation/components/sidebar-profile'
import SideTimer from '@/components/navigation/components/side-timer'

jest.mock('@/hooks/use-custom-query', () => ({
    useCustomQuery: () => ({
        data: {name: '홍길동', email: 'hong@example.com'},
        isLoading: false,
        isError: false,
    }),
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({push: jest.fn()}),
}))

jest.mock('@/hooks/use-toast', () => ({
    __esModule: true,
    default: () => ({showToast: jest.fn()}),
}))

it('GoalList 메뉴 링크가 올바른 href를 갖는다', () => {
    render(<GoalList />)

    const home = screen.getByText('대시 보드').closest('a')
    const notes = screen.getByText('모든 노트 모아보기').closest('a')
    const todos = screen.getByText('할일 리스트').closest('a')
    const goals = screen.getByText('목표 리스트').closest('a')

    expect(home).toHaveAttribute('href', '/')
    expect(notes).toHaveAttribute('href', '/notes')
    expect(todos).toHaveAttribute('href', '/todos')
    expect(goals).toHaveAttribute('href', '/goals')
})

describe('SidebarProfile', () => {
    it('유저 정보 표기', () => {
        render(<Profile />)
        expect(screen.getByText('홍길동')).toBeInTheDocument()
        expect(screen.getByText('hong@example.com')).toBeInTheDocument()
    })
})

const start = jest.fn()
const pause = jest.fn()
const stop = jest.fn()
const reset = jest.fn()

jest.mock('@/store/timer-store', () => ({
    useFocusTimerStore: () => ({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isRunning: false,
        start,
        pause,
        stop,
        reset,
    }),
}))

test('버튼 클릭 시 스토어 메소드 호출', () => {
    render(<SideTimer />)

    const playBtn = screen.getByRole('button', {name: /play/i})
    const stopBtns = screen.getAllByRole('button', {name: /stop/i})
    const resetBtn = screen.getByRole('button', {name: /reset/i})

    expect(playBtn).toBeInTheDocument()
    expect(resetBtn).toBeInTheDocument()

    fireEvent.click(playBtn)
    expect(start).toHaveBeenCalled()

    fireEvent.click(stopBtns[0])
    expect(stop).toHaveBeenCalled()

    fireEvent.click(resetBtn)
    expect(reset).toHaveBeenCalled()
})
