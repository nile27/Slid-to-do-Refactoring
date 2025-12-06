import {Skeleton} from '@/components/ui/skeleton'

export const GoalsTodoContainerSkeleton = () => {
    return (
        <div className="p-5 bg-white rounded-xl">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded-md my-3" />
                <Skeleton className="h-4 w-24 rounded-md" />
            </div>

            <div className="">
                <Skeleton className="h-4 w-full " />
                
            </div>

            <div className="mt-3">
                <Skeleton className="h-4 w-50 " />
            </div>
        </div>
    )
}
