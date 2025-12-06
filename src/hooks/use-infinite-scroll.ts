import {useEffect} from 'react'

import {useInfiniteQuery} from '@tanstack/react-query'
import {useInView} from 'react-intersection-observer'

import type {InfiniteScrollOptions} from '@/types/infinite-scroll'
import type {InfiniteData, QueryKey} from '@tanstack/react-query'

export const useInfiniteScrollQuery = <T>({queryKey, fetchFn}: InfiniteScrollOptions<T>) => {
    const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, error, isLoading, isFetched} =
        useInfiniteQuery<
            {data: T[]; nextCursor: number | undefined},
            Error,
            {data: T[]; nextCursor: number | undefined},
            QueryKey,
            // (string | number | boolean)[],
            number | undefined
        >({
            queryKey,
            queryFn: ({pageParam}) => fetchFn(pageParam),
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
            initialPageParam: undefined,
        })

    const {ref, inView} = useInView({threshold: 0.5})

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    const flatData =
        (data as InfiniteData<{data: T[]; nextCursor: number | undefined}> | undefined)?.pages.flatMap(
            (page) => page.data,
        ) ?? []

    return {
        data: flatData,
        ref,
        isLoading,
        hasMore: hasNextPage,
        isError,
        error,
        isFetched,
    }
}
