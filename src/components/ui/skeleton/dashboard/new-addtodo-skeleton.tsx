import {Skeleton} from '../../skeleton'

export const NewAddtodoSkeleton = () => {
    return (
        <div className="h-[130px] w-full flex-col space-y-2">
            <Skeleton className="h-4.5 w-full rounded-md" />
            <Skeleton className="h-4.5 w-full rounded-md" />
            <Skeleton className="h-4.5 w-full rounded-md" />
            <Skeleton className="h-4.5 w-full rounded-md" />
            <Skeleton className="h-4.5 w-full rounded-md" />
        </div>
    )
}
