import * as reactQuery from '@tanstack/react-query'
import {renderHook, waitFor} from '@testing-library/react'
import {mocked} from 'jest-mock'
import * as reactIntersectionObserver from 'react-intersection-observer'

import {useInfiniteScrollQuery} from '@/hooks/use-infinite-scroll'

jest.mock('@tanstack/react-query')
jest.mock('react-intersection-observer')

const useInfiniteQueryMock = mocked(reactQuery.useInfiniteQuery)
const useInViewMock = mocked(reactIntersectionObserver.useInView)

const createUseInfiniteQueryReturn = (overrides = {}) =>
    ({
        data: undefined,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isError: false,
        error: undefined,
        isLoading: true,
        ...overrides,
    }) as unknown as ReturnType<typeof useInfiniteQueryMock>

beforeEach(() => {
    useInViewMock.mockReturnValue({
        ref: jest.fn(),
        inView: false,
    } as unknown as ReturnType<typeof useInViewMock>)

    useInfiniteQueryMock.mockReturnValue(createUseInfiniteQueryReturn())
})

describe('useInfiniteScrollQuery 테스트', () => {
    it('isLoading이 true로 반환되어야 한다', () => {
        const {result} = renderHook(() =>
            useInfiniteScrollQuery({
                queryKey: ['test'],
                fetchFn: jest.fn(),
            }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual([])
        expect(result.current.hasMore).toBe(false)
        expect(typeof result.current.ref).toBe('function')
    })

    it('fetchFn이 성공적으로 데이터를 반환하면 flatData가 병합되어야 한다', () => {
        useInfiniteQueryMock.mockReturnValueOnce(
            createUseInfiniteQueryReturn({
                data: {
                    pages: [
                        {data: ['item1', 'item2'], nextCursor: 1},
                        {data: ['item3', 'item4'], nextCursor: undefined},
                    ],
                    pageParams: [undefined, 1],
                },
                isLoading: false,
            }),
        )

        const {result} = renderHook(() =>
            useInfiniteScrollQuery({
                queryKey: ['test'],
                fetchFn: jest.fn(),
            }),
        )

        expect(result.current.data).toEqual(['item1', 'item2', 'item3', 'item4'])
    })

    it('inView=false일 때 fetchNextPage 호출되지 않아야 한다', async () => {
        const fetchNextPageMock = jest.fn()

        useInfiniteQueryMock.mockReturnValueOnce(
            createUseInfiniteQueryReturn({
                fetchNextPage: fetchNextPageMock,
                hasNextPage: false,
                isFetchingNextPage: false,
                isLoading: false,
            }),
        )

        renderHook(() =>
            useInfiniteScrollQuery({
                queryKey: ['test'],
                fetchFn: jest.fn(),
            }),
        )

        await waitFor(() => {
            expect(fetchNextPageMock).not.toHaveBeenCalled()
        })
    })
    it('inView=true + hasNextPage=true + isFetchingNextPage=false일 때 fetchNextPage 호출되어야 한다', async () => {
        const fetchNextPageMock = jest.fn()

        useInViewMock.mockReturnValueOnce({
            ref: jest.fn(),
            inView: true,
        } as unknown as ReturnType<typeof useInViewMock>)

        useInfiniteQueryMock.mockReturnValueOnce(
            createUseInfiniteQueryReturn({
                fetchNextPage: fetchNextPageMock,
                hasNextPage: true,
                isFetchingNextPage: false,
                isLoading: false,
            }),
        )

        renderHook(() =>
            useInfiniteScrollQuery({
                queryKey: ['test'],
                fetchFn: jest.fn(),
            }),
        )

        await waitFor(() => {
            expect(fetchNextPageMock).toHaveBeenCalled()
        })
    })

    it('fetchFn이 실패하면 isError가 true로 반환되고 error가 설정되어야 한다', () => {
        const error = new Error('fetch 실패')
        useInfiniteQueryMock.mockReturnValueOnce(
            createUseInfiniteQueryReturn({
                isError: true,
                error,
                isLoading: false,
            }),
        )

        const {result} = renderHook(() =>
            useInfiniteScrollQuery({
                queryKey: ['test'],
                fetchFn: jest.fn(),
            }),
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.error).toBe(error)
    })

    it('hasMore=false일 때 fetchNextPage 호출되지 않아야 한다', async () => {
        const fetchNextPageMock = jest.fn()

        useInViewMock.mockReturnValueOnce({
            ref: jest.fn(),
            inView: true,
        } as unknown as ReturnType<typeof useInViewMock>)

        useInfiniteQueryMock.mockReturnValueOnce(
            createUseInfiniteQueryReturn({
                fetchNextPage: fetchNextPageMock,
                hasNextPage: false,
                isFetchingNextPage: false,
                isLoading: false,
            }),
        )

        renderHook(() =>
            useInfiniteScrollQuery({
                queryKey: ['test'],
                fetchFn: jest.fn(),
            }),
        )

        await waitFor(() => {
            expect(fetchNextPageMock).not.toHaveBeenCalled()
        })
    })

    it('쿼리가 한 번이라도 fetch되면 isFetched가 true로 반환되어야 한다', () => {
        useInfiniteQueryMock.mockReturnValueOnce(
            createUseInfiniteQueryReturn({
                isFetched: true,
                isLoading: false,
            }),
        )

        const {result} = renderHook(() =>
            useInfiniteScrollQuery({
                queryKey: ['test'],
                fetchFn: jest.fn(),
            }),
        )

        expect(result.current.isFetched).toBe(true)
    })
})
