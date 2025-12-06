import type {QueryKey} from '@tanstack/react-query'

export interface InfiniteScrollOptions<T> {
    queryKey: QueryKey
    // queryKey: (string | number | boolean)[]
    fetchFn: (cursor: number | undefined) => Promise<{
        data: T[]
        nextCursor: number | undefined
    }>
}
