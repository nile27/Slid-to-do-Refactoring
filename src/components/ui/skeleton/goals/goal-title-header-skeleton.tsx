import {Skeleton} from '@/components/ui/skeleton'

export const GoalTitleHeaderSkeleton = () => {
    return (
        <div className="w-full pt-6 px-4">
            <div className="w-full h-[144px] p-4 min-w-0 border border-[#D4D5D5] rounded-lg flex flex-col justify-between">
                <Skeleton className="bg-custom_slate-200 h-4 w-full rounded-md my-2" />
                <div>
                    <div className="flex items-center justify-between mt-6 mb-4">
                        <Skeleton className="bg-custom_slate-200 h-4 w-24 rounded-md" />
                        <Skeleton className="bg-custom_slate-200 h-4 w-24 rounded-md" />
                    </div>

                    <Skeleton className="bg-custom_slate-200 h-4 w-full rounded-md mt-1 " />
                </div>
            </div>
            <div className="w-full h-[144px] p-4 min-w-0 border border-[#D4D5D5] rounded-lg mt-7 flex flex-col justify-between">
                <Skeleton className="bg-custom_slate-200 h-4 w-full rounded-md my-2" />
                <div>
                    <div className="flex items-center justify-between mt-6 mb-4">
                        <Skeleton className="bg-custom_slate-200 h-4 w-24 rounded-md" />
                        <Skeleton className="bg-custom_slate-200 h-4 w-24 rounded-md" />
                    </div>

                    <Skeleton className="bg-custom_slate-200 h-4 w-full rounded-md mt-1 " />
                </div>
            </div>
        </div>
    )
}
