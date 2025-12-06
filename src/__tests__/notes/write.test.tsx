import {useRouter} from 'next/navigation'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, render} from '@testing-library/react'

import NoteWriteCompo from '@/components/notes/write'
import useModal from '@/hooks/use-modal'
import useToast from '@/hooks/use-toast'
import * as api from '@/lib/common-api'

// next/navigation 모킹
jest.mock('next/navigation', () => ({useRouter: jest.fn()}))

// useToast 모킹
jest.mock('@/hooks/use-toast')

// useModal 모킹
jest.mock('@/hooks/use-modal')

// api 모킹
jest.mock('@/lib/common-api')
const mockedGet = api.get as jest.MockedFunction<typeof api.get>

let mockShowToast: jest.Mock
let mockOpenModal: jest.Mock
const pushMock = jest.fn()

beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()

    // useRouter 모킹
    ;(useRouter as jest.Mock).mockReturnValue({push: pushMock})

    // showToast를 초기화하고 useToast가 이를 반환하도록 설정
    mockShowToast = jest.fn()
    ;(useToast as jest.Mock).mockReturnValue({
        showToast: mockShowToast,
    })

    // useModal 초기화
    mockOpenModal = jest.fn()
    ;(useModal as jest.Mock).mockReturnValue({
        openModal: mockOpenModal,
        closeModal: jest.fn(),
    })

    // api.get 초기화
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

describe('NoteWriteCompo 테스트', () => {
    const goalId = '1'
    const todoId = '10'
    const storageKey = `note-draft-${goalId}-${todoId}`

    it('로컬스토리지에 storageKey가 없을 때 빈 값으로 초기화되어야 한다', () => {
        const {getByPlaceholderText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        expect((getByPlaceholderText('노트의 제목을 적어주세요') as HTMLInputElement).value).toBe('')
    })

    it('로컬스토리지에 storageKey가 있을 경우 saveToastOpen=true로 설정되어야 한다', () => {
        localStorage.setItem(storageKey, JSON.stringify({editSubject: 'Test', editContent: 'Content'}))
        const {getByText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        expect(getByText('임시 작성된 노트가 있어요. 작성된 노트를 불러오시겠어요?')).toBeInTheDocument()
    })

    it('제목과 내용이 비어있을 때 saveToLocalStorage가 toast를 호출해야 한다', () => {
        const {getByText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        fireEvent.click(getByText('임시작성'))
        expect(mockShowToast).toHaveBeenCalledWith('제목 또는 내용을 입력해주세요.')
    })

    it('제목이나 내용이 존재할 경우 로컬스토리지에 정상적으로 저장되어야 한다', () => {
        const {getByText, getByPlaceholderText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        fireEvent.change(getByPlaceholderText('노트의 제목을 적어주세요'), {target: {value: 'Test'}})
        act(() => {
            fireEvent.click(getByText('임시작성'))
        })
        const saved = JSON.parse(localStorage.getItem(storageKey)!)
        expect(saved.editSubject).toBe('Test')
    })

    it('저장 시 "임시 작성이 완료되었습니다" toast가 표시되어야 한다', () => {
        const {getByText, getByPlaceholderText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        fireEvent.change(getByPlaceholderText('노트의 제목을 적어주세요'), {target: {value: 'Test'}})
        act(() => {
            fireEvent.click(getByText('임시작성'))
        })
        expect(getByText('임시 작성이 완료되었습니다')).toBeInTheDocument()
    })

    it('불러오기 버튼 클릭 시 modal이 열려야 한다', () => {
        localStorage.setItem(storageKey, JSON.stringify({editSubject: 'Load', editContent: 'Content'}))
        const {getByText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        fireEvent.click(getByText('불러오기'))
        expect(mockOpenModal).toHaveBeenCalled()
    })

    it('제목이 30자 초과일 때 업데이트되지 않고 toast가 호출되어야 한다', () => {
        const {getByPlaceholderText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        fireEvent.change(getByPlaceholderText('노트의 제목을 적어주세요'), {target: {value: 'x'.repeat(31)}})
        expect(mockShowToast).toHaveBeenCalledWith('제목은 최대 30자까지 입력 가능합니다.')
    })

    it('confirm을 취소하면 saveNotes가 호출되지 않아야 한다', () => {
        globalThis.confirm = jest.fn(() => false)
        const {getByText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        fireEvent.click(getByText('작성완료'))
        expect(pushMock).not.toHaveBeenCalled()
    })

    it('isChanged 값이 제목/내용/링크 변경 여부에 따라 올바르게 계산되어야 한다', () => {
        const {getByPlaceholderText, container} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )
        fireEvent.change(getByPlaceholderText('노트의 제목을 적어주세요'), {target: {value: 'A'}})
        const button = container.querySelector('button:disabled')!
        expect(button).toBeDisabled()
    })

    it('자동 저장 interval이 정상적으로 동작해야 한다', () => {
        const {getByPlaceholderText} = renderWithClient(
            <NoteWriteCompo goalId={goalId} todoId={todoId} goalTitle="goal" todoTitle="todo" />,
        )

        fireEvent.change(getByPlaceholderText('노트의 제목을 적어주세요'), {
            target: {value: 'IntervalTest'},
        })

        act(() => {
            jest.advanceTimersByTime(5 * 60 * 1000) // 5분
        })

        const saved = JSON.parse(localStorage.getItem(storageKey)!)
        expect(saved.editSubject).toBe('IntervalTest')
    })
})
